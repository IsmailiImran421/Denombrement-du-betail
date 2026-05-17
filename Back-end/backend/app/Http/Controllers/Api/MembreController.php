<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MembreController extends Controller
{
    public function index(): JsonResponse
    {
        $membres = Membre::orderByDesc('id_membre')->get();

        return response()->json($membres);
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('MembreController store request', $request->all());

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
        ]);

        $membre = Membre::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'role' => $validated['role'] ?? null,
        ]);

        return response()->json($membre, 201);
    }

    public function show(Membre $membre): JsonResponse
    {
        return response()->json($membre->load('comites'));
    }

    public function update(Request $request, Membre $membre): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
        ]);

        $membre->update([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'role' => $validated['role'] ?? null,
        ]);

        return response()->json($membre->load('comites'));
    }

    public function destroy(Membre $membre): JsonResponse
    {
        $membre->delete();

        return response()->json([
            'message' => 'Membre supprime avec succes.',
        ]);
    }

}
