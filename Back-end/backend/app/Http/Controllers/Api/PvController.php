<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PvInscription;
use App\Models\PvCollection;
use App\Models\PvBouclage;
use App\Models\Comite;
use App\Models\Eleveur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class PvController extends Controller
{
    private function getAuthEntity(Request $request)
    {
        // Essayer Sanctum (users)
        $token = $request->bearerToken();
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                return $accessToken->tokenable;
            }

            // Essayer le cache (comités)
            $comiteData = Cache::get('comite_token_' . $token);
            if ($comiteData) {
                return (object) [
                    'role'        => 'comite',
                    'role_comite' => $comiteData['role_comite'],
                    'id_comite'   => $comiteData['id_comite'],
                    'nom'         => $comiteData['nom_comite'],
                ];
            }
        }
        return null;
    }

    public function index()
    {
        $pvs = PvInscription::with(['comite', 'eleveur', 'pvCollection', 'pvBouclage'])->get();
        return response()->json($pvs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_comite' => 'nullable|exists:comites,id_comite',
            'id_eleveur' => 'nullable|exists:eleveurs,id_eleveur',
            
            // fields for new eleveur (inscription)
            'nom_eleveur' => 'nullable|string',
            'prenom_eleveur' => 'nullable|string',
            'cin_eleveur' => 'nullable|string',
            'telephone_eleveur' => 'nullable|string',
            'adresse_eleveur' => 'nullable|string',
            'commune_eleveur' => 'nullable|string',

            // fields for collection
            'total_animaux' => 'nullable|integer',
            'total_moutons_males' => 'nullable|integer',
            'total_moutons_femmelles' => 'nullable|integer',
            'total_vaches_males' => 'nullable|integer',
            'total_vaches_femmelles' => 'nullable|integer',
            'total_chevres_males' => 'nullable|integer',
            'total_chevres_femmelles' => 'nullable|integer',
            'total_chamelles_males' => 'nullable|integer',
            'total_chamelles_femmelles' => 'nullable|integer',
            
            // fields for bouclage
            'date_bouclage' => 'nullable|date',
            'nb_animaux_boucles' => 'nullable|integer',
            'marge_boucles_min' => 'nullable|integer',
            'marge_boucles_max' => 'nullable|integer',
            'responsable_bouclage' => 'nullable|string',
        ]);

        // Authentification manuelle (Sanctum + comité cache)
        $user = $this->getAuthEntity($request);
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Pour le moqaddem en inscription, pas besoin de comité
        if (!$validated['id_comite'] && $user->role === 'moqaddem') {
            $role = 'inscription';
            $comite = null;
        } else {
            $comite = Comite::findOrFail($validated['id_comite']);
            $role = $comite->role;
        }

        if ($role === 'inscription') {
            if ($user->role !== 'moqaddem') {
                return response()->json(['error' => 'Non autorisé : seule la moqaddem peut effectuer l\'inscription.'], 403);
            }
        }

        if ($role === 'collection' || $role === 'bouclage') {
            if ($user->role !== 'comite') {
                return response()->json(['error' => 'Non autorisé : seuls les comités peuvent effectuer la collection et le bouclage.'], 403);
            }
        }

        DB::beginTransaction();

        try {
            $id_eleveur = $validated['id_eleveur'] ?? null;

            if ($role === 'inscription') {
                if (!$validated['nom_eleveur'] || !$validated['cin_eleveur'] || !$validated['telephone_eleveur']) {
                    throw new \Exception("Les informations de l'éleveur sont obligatoires pour l'inscription.");
                }

                // Check if eleveur with CIN already exists
                $existingEleveur = Eleveur::where('cin', $validated['cin_eleveur'])->first();
                if ($existingEleveur) {
                    throw new \Exception("Un éleveur avec cette CIN existe déjà.");
                }

                // Ne pas créer de compte utilisateur automatiquement.
                // Le compte d'éleveur sera créé plus tard, après validation du PV de bouclage.
                $eleveur = Eleveur::create([
                    'nom' => $validated['nom_eleveur'],
                    'prenom' => $validated['prenom_eleveur'] ?? '',
                    'cin' => $validated['cin_eleveur'],
                    'telephone' => $validated['telephone_eleveur'],
                    'adresse' => $validated['adresse_eleveur'] ?? '',
                    'commune' => $validated['commune_eleveur'] ?? '',
                    'compte_actif' => false,
                    'id_utilisateur' => null,
                ]);

                $id_eleveur = $eleveur->id_eleveur;

                $pvInscription = PvInscription::create([
                    'id_eleveur' => $id_eleveur,
                    'id_comite' => $comite ? $comite->id_comite : null,
                    'date_generation' => now()
                ]);
            } else {
                if (!$id_eleveur) {
                    throw new \Exception("L'éleveur est obligatoire pour la collection et le bouclage.");
                }
                
                $pvInscription = PvInscription::where('id_eleveur', $id_eleveur)->first();
                if (!$pvInscription) {
                    throw new \Exception("Cet éleveur n'a pas de PV d'inscription.");
                }

                if ($comite && $pvInscription->id_comite !== $comite->id_comite) {
                    $pvInscription->id_comite = $comite->id_comite;
                    $pvInscription->save();
                }

                if ($role === 'collection') {
                    PvCollection::updateOrCreate(
                        ['id_rapport' => $pvInscription->id_rapport],
                        [
                            'total_animaux' => $validated['total_animaux'] ?? 0,
                            'total_moutons_males' => $validated['total_moutons_males'] ?? 0,
                            'total_moutons_femmelles' => $validated['total_moutons_femmelles'] ?? 0,
                            'total_vaches_males' => $validated['total_vaches_males'] ?? 0,
                            'total_vaches_femmelles' => $validated['total_vaches_femmelles'] ?? 0,
                            'total_chevres_males' => $validated['total_chevres_males'] ?? 0,
                            'total_chevres_femmelles' => $validated['total_chevres_femmelles'] ?? 0,
                            'total_chamelles_males' => $validated['total_chamelles_males'] ?? 0,
                            'total_chamelles_femmelles' => $validated['total_chamelles_femmelles'] ?? 0,
                        ]
                    );
                } elseif ($role === 'bouclage') {
                    if (!$pvInscription->pvCollection) {
                        throw new \Exception("Le bouclage ne peut pas être enregistré avant la collection.");
                    }

                    PvBouclage::updateOrCreate(
                        ['id_rapport' => $pvInscription->id_rapport],
                        [
                            'date_bouclage' => $validated['date_bouclage'] ?? now(),
                            'nb_animaux_boucles' => $validated['nb_animaux_boucles'] ?? 0,
                            'marge_boucles_min' => $validated['marge_boucles_min'] ?? null,
                            'marge_boucles_max' => $validated['marge_boucles_max'] ?? null,
                            'responsable_bouclage' => $validated['responsable_bouclage'] ?? '',
                            'id_eleveur' => $id_eleveur,
                        ]
                    );
                }
            }

            DB::commit();

            return response()->json($pvInscription->load(['pvCollection', 'pvBouclage']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    private function makeEleveurEmail(Eleveur $eleveur)
    {
        $base = preg_replace('/[^a-z0-9._-]+/', '.', strtolower($eleveur->cin));
        $base = trim($base, '.');
        $email = $base . '@eleveur.local';
        $suffix = 1;

        while (User::where('email', $email)->exists()) {
            $email = $base . '.' . $suffix++ . '@eleveur.local';
        }

        return $email;
    }

    public function validerBouclage(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin_regional') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $pv = PvInscription::with(['comite', 'eleveur', 'pvBouclage'])->findOrFail($id);

        if (!$pv->comite || $pv->comite->region !== $user->region) {
            return response()->json(['error' => 'PV hors de la région autorisée'], 403);
        }

        if (!$pv->pvBouclage) {
            return response()->json(['error' => 'Ce PV n\'a pas encore de bouclage validé.'], 400);
        }

        if (!$pv->pvCollection || !$pv->pvCollection->valide) {
            return response()->json(['error' => 'La collection doit être validée avant le bouclage.'], 400);
        }

        if (!$pv->eleveur) {
            return response()->json(['error' => 'Éleveur introuvable pour ce PV.'], 400);
        }

        if ($pv->eleveur->compte_actif && $pv->eleveur->id_utilisateur) {
            return response()->json(['message' => 'Le compte de l\'éleveur est déjà activé.'], 200);
        }

        $password = Str::random(10);
        $email = $this->makeEleveurEmail($pv->eleveur);

        $eleveurUser = User::create([
            'nom'        => $pv->eleveur->nom,
            'email'      => $email,
            'mot_de_passe' => Hash::make($password),
            'type'       => 'eleveur',
            'role'       => 'eleveur',
            'region'     => $pv->comite->region,
            'created_by' => $user->id_utilisateur,
        ]);

        $pv->eleveur->compte_actif = true;
        $pv->eleveur->id_utilisateur = $eleveurUser->id_utilisateur;
        $pv->eleveur->save();

        return response()->json([
            'message' => 'Bouclage validé et compte éleveur créé.',
            'eleveur_id' => $pv->eleveur->id_eleveur,
            'user' => [
                'id_utilisateur' => $eleveurUser->id_utilisateur,
                'nom' => $eleveurUser->nom,
                'email' => $eleveurUser->email,
            ],
            'credentials' => [
                'email' => $eleveurUser->email,
                'password' => $password,
            ],
        ], 200);
    }

    public function validerCollection(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin_regional') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $pv = PvInscription::with(['comite', 'pvCollection'])->findOrFail($id);

        if (!$pv->comite || $pv->comite->region !== $user->region) {
            return response()->json(['error' => 'PV hors de la région autorisée'], 403);
        }

        if (!$pv->pvCollection) {
            return response()->json(['error' => 'Ce PV n\'a pas encore de collection.'], 400);
        }

        if ($pv->pvCollection->valide) {
            return response()->json(['message' => 'La collection a déjà été validée.'], 200);
        }

        $pv->pvCollection->valide = true;
        $pv->pvCollection->save();

        return response()->json([
            'message' => 'Collection validée avec succès.',
            'pv' => $pv->load(['pvCollection']),
        ], 200);
    }

    public function generatePdf($id)
    {
        $pv = PvInscription::with(['comite', 'eleveur', 'pvCollection', 'pvBouclage'])->findOrFail($id);

        $pdf = new \FPDF();
        $pdf->AddPage();
        
        // Colors
        $blue = [41, 128, 185];
        $lightGray = [240, 240, 240];
        $darkGray = [50, 50, 50];

        // --- HEADER ---
        $pdf->SetFont('Arial', 'B', 18);
        $pdf->SetTextColor($blue[0], $blue[1], $blue[2]);
        $pdf->Cell(0, 15, utf8_decode('Procès-Verbal de Recensement et Bouclage'), 0, 1, 'C');
        
        $pdf->SetFont('Arial', 'I', 10);
        $pdf->SetTextColor($darkGray[0], $darkGray[1], $darkGray[2]);
        $pdf->Cell(0, 5, utf8_decode('Généré le : ' . now()->format('d/m/Y H:i')), 0, 1, 'R');
        $pdf->Ln(5);

        // Reset Text Color
        $pdf->SetTextColor(0, 0, 0);

        // Helper function for Section Header
        $printSectionHeader = function($title) use ($pdf, $blue) {
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->SetFillColor($blue[0], $blue[1], $blue[2]);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->Cell(0, 8, utf8_decode('  ' . $title), 0, 1, 'L', true);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->Ln(2);
        };

        // --- SECTION 1: ÉLEVEUR ---
        $printSectionHeader('1. Informations de l\'Éleveur (Inscription)');
        $pdf->SetFont('Arial', '', 11);
        $eleveur = $pv->eleveur;
        
        $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->Cell(45, 8, utf8_decode(' Nom & Prénom :'), 1, 0, 'L', true);
        $pdf->Cell(50, 8, utf8_decode(' ' . $eleveur->nom . ' ' . $eleveur->prenom), 1, 0, 'L');
        $pdf->Cell(45, 8, utf8_decode(' CIN :'), 1, 0, 'L', true);
        $pdf->Cell(50, 8, utf8_decode(' ' . $eleveur->cin), 1, 1, 'L');

        $pdf->Cell(45, 8, utf8_decode(' Téléphone :'), 1, 0, 'L', true);
        $pdf->Cell(50, 8, utf8_decode(' ' . $eleveur->telephone), 1, 0, 'L');
        $pdf->Cell(45, 8, utf8_decode(' Commune :'), 1, 0, 'L', true);
        $pdf->Cell(50, 8, utf8_decode(' ' . $eleveur->commune), 1, 1, 'L');

        $pdf->Cell(45, 8, utf8_decode(' Adresse :'), 1, 0, 'L', true);
        $pdf->Cell(145, 8, utf8_decode(' ' . $eleveur->adresse), 1, 1, 'L');

        $pdf->Cell(45, 8, utf8_decode(' Date d\'inscription :'), 1, 0, 'L', true);
        $pdf->Cell(145, 8, utf8_decode(' ' . $pv->date_generation->format('d/m/Y')), 1, 1, 'L');
        
        $pdf->Ln(8);

        // --- SECTION 2: COLLECTION ---
        $printSectionHeader('2. Données de Collection');
        if ($pv->pvCollection) {
            $col = $pv->pvCollection;
            $pdf->SetFont('Arial', 'B', 11);
            $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
            $pdf->Cell(45, 8, utf8_decode(' Total des animaux :'), 1, 0, 'L', true);
            $pdf->SetFont('Arial', '', 11);
            $pdf->Cell(145, 8, ' ' . $col->total_animaux, 1, 1, 'L');
            
            $pdf->Ln(2);
            
            // Sub-table for animal types
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->SetFillColor(220, 220, 220);
            $pdf->Cell(60, 7, utf8_decode('Type d\'animal'), 1, 0, 'C', true);
            $pdf->Cell(65, 7, utf8_decode('Mâles'), 1, 0, 'C', true);
            $pdf->Cell(65, 7, utf8_decode('Femelles'), 1, 1, 'C', true);
            
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(60, 7, utf8_decode('Moutons'), 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_moutons_males, 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_moutons_femmelles, 1, 1, 'C');

            $pdf->Cell(60, 7, utf8_decode('Vaches'), 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_vaches_males, 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_vaches_femmelles, 1, 1, 'C');

            $pdf->Cell(60, 7, utf8_decode('Chèvres'), 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_chevres_males, 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_chevres_femmelles, 1, 1, 'C');

            $pdf->Cell(60, 7, utf8_decode('Chamelles'), 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_chamelles_males, 1, 0, 'C');
            $pdf->Cell(65, 7, $col->total_chamelles_femmelles, 1, 1, 'C');

        } else {
            $pdf->SetFont('Arial', 'I', 11);
            $pdf->SetTextColor(150, 150, 150);
            $pdf->Cell(0, 10, utf8_decode('Données de collection non encore saisies.'), 1, 1, 'C');
            $pdf->SetTextColor(0, 0, 0);
        }
        $pdf->Ln(8);

        // --- SECTION 3: BOUCLAGE ---
        $printSectionHeader('3. Données de Bouclage');
        if ($pv->pvBouclage) {
            $bouc = $pv->pvBouclage;
            $pdf->SetFont('Arial', '', 11);
            
            $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
            
            $dateBouc = date('d/m/Y', strtotime($bouc->date_bouclage));

            $pdf->Cell(50, 8, utf8_decode(' Date de bouclage :'), 1, 0, 'L', true);
            $pdf->Cell(140, 8, utf8_decode(' ' . $dateBouc), 1, 1, 'L');
            
            $pdf->Cell(50, 8, utf8_decode(' Animaux bouclés :'), 1, 0, 'L', true);
            $pdf->Cell(45, 8, ' ' . $bouc->nb_animaux_boucles, 1, 0, 'L');
            $pdf->Cell(50, 8, utf8_decode(' Boucles utilisées :'), 1, 0, 'L', true);
            // Afficher la marge si renseignée, sinon le nombre exact
            $bouclesText = '';
            if (!is_null($bouc->marge_boucles_min) || !is_null($bouc->marge_boucles_max)) {
                if (!is_null($bouc->marge_boucles_min) && !is_null($bouc->marge_boucles_max)) {
                    $bouclesText = 'de ' . $bouc->marge_boucles_min . ' à ' . $bouc->marge_boucles_max;
                } elseif (!is_null($bouc->marge_boucles_min)) {
                    $bouclesText = '≥ ' . $bouc->marge_boucles_min;
                } else {
                    $bouclesText = '≤ ' . $bouc->marge_boucles_max;
                }
            } else {
                // Aucun nb_boucles_utilisees : ne rien afficher
                $bouclesText = '';
            }
            $pdf->Cell(45, 8, ' ' . $bouclesText, 1, 1, 'L');
            
            $pdf->Cell(50, 8, utf8_decode(' Responsable :'), 1, 0, 'L', true);
            $pdf->Cell(140, 8, utf8_decode(' ' . $bouc->responsable_bouclage), 1, 1, 'L');
        } else {
            $pdf->SetFont('Arial', 'I', 11);
            $pdf->SetTextColor(150, 150, 150);
            $pdf->Cell(0, 10, utf8_decode('Données de bouclage non encore saisies.'), 1, 1, 'C');
            $pdf->SetTextColor(0, 0, 0);
        }

        // Footer signatures
        $pdf->Ln(15);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(95, 6, utf8_decode('Signature du Responsable :'), 0, 0, 'C');
        $pdf->Cell(95, 6, utf8_decode('Signature de l\'Éleveur :'), 0, 1, 'C');

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="PV_' . $eleveur->cin . '.pdf"');
    }
}
