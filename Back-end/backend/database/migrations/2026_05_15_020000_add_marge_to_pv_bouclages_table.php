<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMargeToPvBouclagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pv_bouclages', function (Blueprint $table) {
            $table->integer('marge_boucles_min')->nullable()->after('nb_boucles_utilisees');
            $table->integer('marge_boucles_max')->nullable()->after('marge_boucles_min');
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
            $table->dropColumn(['marge_boucles_min', 'marge_boucles_max']);
        });
    }
}
