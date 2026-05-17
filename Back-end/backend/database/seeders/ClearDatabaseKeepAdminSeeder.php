<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearDatabaseKeepAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        // Récupérer les admins régionaux existants
        $admins = DB::table('users')->where('role', 'admin_regional')->get()->map(function ($a) {
            // Convert to array and remove attributes we don't want to preserve empty
            $arr = (array) $a;
            return $arr;
        })->toArray();

        if (count($admins) === 0) {
            $this->command->error('Aucun utilisateur avec le role admin_regional trouvé. Aucune action effectuée.');
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Récupérer toutes les tables de la base
        $tables = DB::select('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?', [$database]);

        foreach ($tables as $t) {
            $table = $t->TABLE_NAME;
            if ($table === 'migrations') continue;
            DB::table($table)->truncate();
        }

        // Restaurer les admins régionaux
        foreach ($admins as $admin) {
            // Ensure timestamps are set if missing
            if (!isset($admin['created_at'])) $admin['created_at'] = now();
            if (!isset($admin['updated_at'])) $admin['updated_at'] = now();
            DB::table('users')->insert($admin);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Base vidée et admin régional restauré.');
    }
}
