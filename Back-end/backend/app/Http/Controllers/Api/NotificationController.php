<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;

class NotificationController extends Controller
{
    private function getAuthEntity(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                return $accessToken->tokenable;
            }

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

    public function index(Request $request)
    {
        $entity = $this->getAuthEntity($request);
        if (!$entity) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $query = Notification::query();

        if (isset($entity->role) && $entity->role === 'comite') {
            $query->where('id_comite', $entity->id_comite);
        } else {
            $query->where('id_utilisateur', $entity->id_utilisateur);
        }

        $notifications = $query->orderByDesc('created_at')->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $entity = $this->getAuthEntity($request);
        if (!$entity) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $query = Notification::query();

        if (isset($entity->role) && $entity->role === 'comite') {
            $query->where('id_comite', $entity->id_comite);
        } else {
            $query->where('id_utilisateur', $entity->id_utilisateur);
        }

        $notification = $query->findOrFail($id);
        $notification->update(['lu' => true]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    public function markAllAsRead(Request $request)
    {
        $entity = $this->getAuthEntity($request);
        if (!$entity) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $query = Notification::query();

        if (isset($entity->role) && $entity->role === 'comite') {
            $query->where('id_comite', $entity->id_comite);
        } else {
            $query->where('id_utilisateur', $entity->id_utilisateur);
        }

        $query->where('lu', false)->update(['lu' => true]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }
}
