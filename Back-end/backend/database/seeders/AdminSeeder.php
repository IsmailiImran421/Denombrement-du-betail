<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Admin Local
        User::firstOrCreate(
            ['email' => 'admin.local@errachidia.ma'],
            [
                'nom'          => 'Admin Local',
                'mot_de_passe' => '123456',
                'role'         => 'admin_local',
                'type'         => 'admin',
                'region'       => 'Drâa-Tafilalet',
            ]
        );

        // Admin Régional
        User::firstOrCreate(
            ['email' => 'admin.regional@errachidia.ma'],
            [
                'nom'          => 'Admin Regional',
                'mot_de_passe' => '123456',
                'role'         => 'admin_regional',
                'type'         => 'admin',
                'region'       => 'Drâa-Tafilalet',
            ]
        );

        echo "Comptes admin créés/vérifiés avec succès !\n";
    }
}
