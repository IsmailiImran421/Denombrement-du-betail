<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Comite;
use App\Models\PvInscription;
use App\Models\PvCollection;
use App\Models\PvBouclage;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs créés par l'admin connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = User::query();

        if ($user->role === 'admin_regional') {
            // L'admin régional voit les admins locaux de sa région
            $query->where('region', $user->region)->where('role', 'admin_local');
        } elseif ($user->role === 'admin_local') {
            // L'admin local voit les moqaddems qu'il a créés
            $query->where('created_by', $user->id_utilisateur)->where('role', 'moqaddem');
        } else {
            return response()->json([], 200);
        }

        return response()->json($query->get());
    }

    /**
     * Créer un Admin Local (par Admin Régional)
     */
    public function createAdminLocal(Request $request)
    {
        $creator = $request->user();

        if ($creator->role !== 'admin_regional') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'nom'   => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'nom'          => $request->nom,
            'email'        => $request->email,
            'mot_de_passe' => $request->password,
            'role'         => 'admin_local',
            'type'         => 'admin',
            'region'       => $creator->region,
            'created_by'   => $creator->id_utilisateur,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Créer un Moqaddem (par Admin Local)
     */
    public function createMoqaddem(Request $request)
    {
        $creator = $request->user();

        if ($creator->role !== 'admin_local') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'nom'   => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'nom'          => $request->nom,
            'email'        => $request->email,
            'mot_de_passe' => $request->password,
            'role'         => 'moqaddem',
            'type'         => 'agent',
            'region'       => $creator->region,
            'created_by'   => $creator->id_utilisateur,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Assigner des credentials à un comité (par Admin Local)
     */
    public function assignComiteCredentials(Request $request, $id)
    {
        $creator = $request->user();

        if ($creator->role !== 'admin_local') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'email_comite'    => 'required|email|unique:comites,email_comite,' . $id . ',id_comite',
            'password_comite' => 'required|string|min:6',
        ]);

        $comite = Comite::findOrFail($id);
        
        $updateData = [
            'email_comite'    => $request->email_comite,
            'password_comite' => bcrypt($request->password_comite),
        ];
        
        // Only set region and created_by if not already set
        if (!$comite->region) {
            $updateData['region'] = $creator->region;
        }
        if (!$comite->created_by) {
            $updateData['created_by'] = $creator->id_utilisateur;
        }
        
        $comite->update($updateData);

        return response()->json($comite);
    }

    /**
     * Statistiques régionales (pour Admin Régional)
     */
    public function statsRegion(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin_regional') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $region = $user->region;

        // Compter les comités de la région
        $nb_comites = Comite::where('region', $region)->count();

        // Comités par rôle
        $comites_inscription = Comite::where('region', $region)->where('role', 'inscription')->count();
        $comites_collection  = Comite::where('region', $region)->where('role', 'collection')->count();
        $comites_bouclage    = Comite::where('region', $region)->where('role', 'bouclage')->count();

        // Moqaddems (utilisateurs de type moqaddem) dans la région
        $nb_moqaddems = User::where('region', $region)->where('role', 'moqaddem')->count();

        // PVs de la région (via comités de la région)
        $comite_ids = Comite::where('region', $region)->pluck('id_comite');
        $nb_pvs = PvInscription::whereIn('id_comite', $comite_ids)->count();
        $nb_collections = PvCollection::whereHas('pvInscription', function($q) use ($comite_ids) {
            $q->whereIn('id_comite', $comite_ids);
        })->count();
        $nb_bouclages = PvBouclage::whereIn('id_rapport', 
            PvInscription::whereIn('id_comite', $comite_ids)->pluck('id_rapport')
        )->count();

        // Admins locaux de la région
        $nb_admin_locaux = User::where('region', $region)->where('role', 'admin_local')->count();

        return response()->json([
            'region'               => $region,
            'nb_comites'           => $nb_comites,
            'comites_inscription'  => $comites_inscription,
            'comites_collection'   => $comites_collection,
            'comites_bouclage'     => $comites_bouclage,
            'nb_moqaddems'         => $nb_moqaddems,
            'nb_pvs_inscription'   => $nb_pvs,
            'nb_pvs_collection'    => $nb_collections,
            'nb_pvs_bouclage'      => $nb_bouclages,
            'nb_admin_locaux'      => $nb_admin_locaux,
        ]);
    }

    /**
     * Liste des PVs à valider (pour Admin Régional)
     */
    public function pvsAValider(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin_regional') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $comite_ids = Comite::where('region', $user->region)->pluck('id_comite');

        $pvs = PvInscription::with(['comite', 'eleveur', 'pvCollection', 'pvBouclage'])
            ->whereIn('id_comite', $comite_ids)
            ->get();

        return response()->json($pvs);
    }
}
