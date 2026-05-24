<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Comite;
use App\Models\Eleveur;
use App\Models\Notification;
use App\Models\PvInscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_inscription_generates_notifications()
    {
        // 1. Create Regional Admin (to be creator/auth context if needed, or just Moqaddem and Local Admin)
        $localAdmin = User::create([
            'nom' => 'Admin Local Test',
            'email' => 'local@test.com',
            'mot_de_passe' => 'password123',
            'role' => 'admin_local',
            'type' => 'admin',
            'region' => 'Drâa-Tafilalet',
        ]);

        $moqaddem = User::create([
            'nom' => 'Moqaddem Test',
            'email' => 'moqaddem@test.com',
            'mot_de_passe' => 'password123',
            'role' => 'moqaddem',
            'type' => 'agent',
            'region' => 'Drâa-Tafilalet',
            'created_by' => $localAdmin->id_utilisateur,
        ]);

        // Create a committee for collection in the same region
        $collectionComite = Comite::create([
            'nom_comite' => 'Comite Collection Test',
            'role' => 'collection',
            'region' => 'Drâa-Tafilalet',
        ]);

        // Login as Moqaddem to get a token
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'moqaddem@test.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('access_token');

        // 2. Submit a new inscription PV
        $response = $this->postJson('/api/pvs', [
            'nom_eleveur' => 'Eleveur Test',
            'prenom_eleveur' => 'Prenom',
            'cin_eleveur' => 'EE123456',
            'telephone_eleveur' => '0612345678',
            'adresse_eleveur' => 'Errachidia Centre',
            'commune_eleveur' => 'Errachidia',
            'id_comite' => null,
        ], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(201);

        // 3. Verify notification is created in database
        $this->assertDatabaseHas('notifications', [
            'id_utilisateur' => $localAdmin->id_utilisateur,
            'titre' => 'Nouvel éleveur inscrit',
            'type_tache' => 'collection',
            'lu' => false,
        ]);

        $this->assertDatabaseHas('notifications', [
            'id_comite' => $collectionComite->id_comite,
            'titre' => 'Nouvelle tâche de collection',
            'type_tache' => 'collection',
            'lu' => false,
        ]);

        // 4. Log in as Local Admin to view notifications
        $adminLoginResponse = $this->postJson('/api/login', [
            'email' => 'local@test.com',
            'password' => 'password123',
        ]);
        $adminLoginResponse->assertStatus(200);
        $adminToken = $adminLoginResponse->json('access_token');

        // Fetch notifications for Admin Local
        $notifResponse = $this->getJson('/api/notifications', [
            'Authorization' => "Bearer $adminToken",
        ]);
        $notifResponse->assertStatus(200);
        $notifications = $notifResponse->json();
        $this->assertCount(1, $notifications);
        $this->assertEquals('Nouvel éleveur inscrit', $notifications[0]['titre']);

        // Mark as read
        $notifId = $notifications[0]['id_notification'];
        $readResponse = $this->postJson("/api/notifications/{$notifId}/read", [], [
            'Authorization' => "Bearer $adminToken",
        ]);
        $readResponse->assertStatus(200);

        // Verify state is updated to read
        $this->assertDatabaseHas('notifications', [
            'id_notification' => $notifId,
            'lu' => true,
        ]);
    }
}
