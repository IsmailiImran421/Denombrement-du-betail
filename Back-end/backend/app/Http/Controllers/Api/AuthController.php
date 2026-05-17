<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        $comite = null;

        // Essayer d'authentifier comme utilisateur d'abord
        if ($user) {
            $passwordOk = ($user->mot_de_passe === $request->password)
                       || Hash::check($request->password, $user->mot_de_passe);

            if (!$passwordOk) {
                $user = null;
            }
        }

        // Si pas d'utilisateur, essayer de s'authentifier comme comité
        if (!$user) {
            $comite = \App\Models\Comite::where('email_comite', $request->email)->first();
            if ($comite) {
                $passwordOk = ($comite->password_comite === $request->password)
                           || Hash::check($request->password, $comite->password_comite);
                if (!$passwordOk) {
                    $comite = null;
                }
            }
        }

        if (!$user && !$comite) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        // Si c'est un comité
        if ($comite) {
            $token = Str::random(60);
            Cache::put('comite_token_' . $token, [
                'id_comite'  => $comite->id_comite,
                'email_comite' => $comite->email_comite,
                'nom_comite' => $comite->nom_comite,
                'role_comite' => $comite->role,
            ], now()->addDays(7));

            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => [
                    'nom' => $comite->nom_comite,
                    'email' => $comite->email_comite,
                    'role' => 'comite',
                    'role_comite' => $comite->role,
                    'id_comite' => $comite->id_comite,
                ],
            ]);
        }

        // Si admin_regional, on enregistre sa région
        if ($user->role === 'admin_regional' && $request->region) {
            $user->update(['region' => $request->region]);
            $user->refresh();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    public function me(Request $request)
    {
        $token = $request->bearerToken();

        if ($token) {
            // Essayer Sanctum (users)
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                return response()->json($accessToken->tokenable);
            }

            // Essayer le cache (comités)
            $comiteData = Cache::get('comite_token_' . $token);
            if ($comiteData) {
                return response()->json([
                    'nom'         => $comiteData['nom_comite'],
                    'email'       => $comiteData['email_comite'],
                    'role'        => 'comite',
                    'role_comite' => $comiteData['role_comite'],
                    'id_comite'   => $comiteData['id_comite'],
                ]);
            }
        }

        return response()->json(['message' => 'Token invalide'], 401);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();

        if ($token) {
            // Essayer Sanctum (users)
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $accessToken->delete();
                return response()->json(['message' => 'Déconnecté avec succès']);
            }

            // Essayer le cache (comités)
            if (Cache::has('comite_token_' . $token)) {
                Cache::forget('comite_token_' . $token);
                return response()->json(['message' => 'Déconnecté avec succès']);
            }
        }

        return response()->json(['message' => 'Non authentifié'], 401);
    }
}
