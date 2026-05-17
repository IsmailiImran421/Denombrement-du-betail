<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePvBouclagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pv_bouclages', function (Blueprint $table) {
            $table->unsignedBigInteger('id_rapport')->primary();
            $table->date('date_bouclage');
            $table->integer('nb_animaux_boucles')->default(0);
            $table->integer('nb_boucles_utilisees')->default(0);
            $table->string('responsable_bouclage');
            $table->unsignedBigInteger('id_eleveur');
            $table->timestamps();

            $table->foreign('id_rapport')
                ->references('id_rapport')
                ->on('pv_inscriptions')
                ->onDelete('cascade');

            $table->foreign('id_eleveur')
                ->references('id_eleveur')
                ->on('eleveurs')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pv_bouclages');
    }
}
