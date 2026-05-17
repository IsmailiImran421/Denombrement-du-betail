<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComiteController extends Controller
{
    public function index(): JsonResponse
    {
        $comites = Comite::with(['membres'])
            ->orderByDesc('id_comite')
            ->get();

        return response()->json($comites);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_comite' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255', Rule::in(['collection', 'bouclage'])],
            'membre_ids' => ['nullable', 'array'],
            'membre_ids.*' => ['integer', Rule::exists('membres', 'id_membre')],
        ]);

        $user = $request->user();
        
        // Assigner automatiquement la région de l'utilisateur authentifié
        $region = $user && $user->region ? $user->region : null;

        $comite = Comite::create([
            'nom_comite' => $validated['nom_comite'],
            'role' => $validated['role'] ?? null,
            'region' => $region,
            'created_by' => $user ? $user->id_utilisateur : null,
        ]);

        $comite->membres()->sync($validated['membre_ids'] ?? []);

        return response()->json($comite->load(['membres']), 201);
    }

    public function show(Comite $comite): JsonResponse
    {
        return response()->json($comite->load(['membres', 'pvInscriptions']));
    }

    public function update(Request $request, Comite $comite): JsonResponse
    {
        $validated = $request->validate([
            'nom_comite' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255', Rule::in(['collection', 'bouclage'])],
            'membre_ids' => ['nullable', 'array'],
            'membre_ids.*' => ['integer', Rule::exists('membres', 'id_membre')],
        ]);

        $comite->update([
            'nom_comite' => $validated['nom_comite'],
            'role' => $validated['role'] ?? null,
        ]);

        if (array_key_exists('membre_ids', $validated)) {
            $comite->membres()->sync($validated['membre_ids']);
        }

        return response()->json($comite->load(['membres']));
    }

    public function destroy(Comite $comite): JsonResponse
    {
        $comite->delete();

        return response()->json([
            'message' => 'Comite supprime avec succes.',
        ]);
    }
}
