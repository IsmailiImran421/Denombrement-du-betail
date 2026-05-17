<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropNbBouclesUtiliseesFromPvBouclagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pv_bouclages', function (Blueprint $table) {
            if (Schema::hasColumn('pv_bouclages', 'nb_boucles_utilisees')) {
                $table->dropColumn('nb_boucles_utilisees');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pv_bouclages', function (Blueprint $table) {
            $table->integer('nb_boucles_utilisees')->default(0)->after('nb_animaux_boucles');
        });
    }
}
