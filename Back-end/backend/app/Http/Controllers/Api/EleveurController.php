<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Eleveur;
use App\Models\Reclamation;
use Illuminate\Http\Request;

class EleveurController extends Controller
{
    public function index()
    {
        return response()->json(Eleveur::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|max:255|unique:eleveurs',
        ]);
        
        $eleveur = Eleveur::create($validated);
        return response()->json($eleveur, 201);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'eleveur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $eleveur = Eleveur::with(['pvInscription.pvCollection', 'pvInscription.pvBouclage', 'reclamations'])
            ->where('id_utilisateur', $user->id_utilisateur)
            ->first();

        if (!$eleveur) {
            return response()->json(['error' => 'Éleveur introuvable'], 404);
        }

        $pv = $eleveur->pvInscription;
        $collection = optional($pv)->pvCollection;
        $bouclage = optional($pv)->pvBouclage;

        $moutonsChevres = 0;
        $vachesChamelles = 0;
        $montant = 0;

        if ($collection) {
            $moutonsChevres =
                ($collection->total_moutons_males ?? 0) +
                ($collection->total_moutons_femmelles ?? 0) +
                ($collection->total_chevres_males ?? 0) +
                ($collection->total_chevres_femmelles ?? 0);
            $vachesChamelles =
                ($collection->total_vaches_males ?? 0) +
                ($collection->total_vaches_femmelles ?? 0) +
                ($collection->total_chamelles_males ?? 0) +
                ($collection->total_chamelles_femmelles ?? 0);
            $montant = $moutonsChevres * 100 + $vachesChamelles * 150;
        }

        return response()->json([
            'eleveur' => $eleveur,
            'pv' => $pv,
            'collection' => $collection,
            'bouclage' => $bouclage,
            'stats' => [
                'pv_inscription' => (bool) $pv,
                'collection' => (bool) $collection,
                'collection_valide' => optional($collection)->valide ?? false,
                'bouclage' => (bool) $bouclage,
                'compte_actif' => (bool) $eleveur->compte_actif,
                'moutons_chevres' => $moutonsChevres,
                'vaches_chamelles' => $vachesChamelles,
                'montant_remboursement' => $montant,
                'reclamations_count' => $eleveur->reclamations->count(),
            ],
            'reclamations' => $eleveur->reclamations,
        ]);
    }

    public function reclamations(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'eleveur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $eleveur = Eleveur::where('id_utilisateur', $user->id_utilisateur)->first();
        if (!$eleveur) {
            return response()->json(['error' => 'Éleveur introuvable'], 404);
        }

        return response()->json($eleveur->reclamations()->orderBy('date_plainte', 'desc')->get());
    }

    public function storeReclamation(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'eleveur') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $eleveur = Eleveur::with('pvInscription.comite')->where('id_utilisateur', $user->id_utilisateur)->first();
        if (!$eleveur) {
            return response()->json(['error' => 'Éleveur introuvable'], 404);
        }

        $validated = $request->request->all(); // Workaround for simple validation or use validate
        $validated = $request->validate([
            'sujet' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $reclamation = Reclamation::create([
            'sujet' => $validated['sujet'],
            'description' => $validated['description'],
            'date_plainte' => now(),
            'id_eleveur' => $eleveur->id_eleveur,
        ]);

        // Notifier les administrateurs locaux de la région
        $region = optional(optional($eleveur->pvInscription)->comite)->region;
        if ($region) {
            $adminLocals = \App\Models\User::where('role', 'admin_local')
                                           ->where('region', $region)
                                           ->get();
            
            foreach ($adminLocals as $admin) {
                \App\Models\Notification::create([
                    'id_utilisateur' => $admin->id_utilisateur,
                    'titre' => 'Nouvelle Réclamation',
                    'message' => 'L\'éleveur ' . $eleveur->nom . ' ' . $eleveur->prenom . ' a soumis une nouvelle réclamation : ' . $reclamation->sujet,
                    'type_tache' => 'reclamation',
                    'id_reference' => $reclamation->id_plainte,
                ]);
            }
        }

        return response()->json($reclamation, 201);
    }
}
