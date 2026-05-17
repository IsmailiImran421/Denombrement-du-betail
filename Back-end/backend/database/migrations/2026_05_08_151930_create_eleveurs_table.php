<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEleveursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('eleveurs', function (Blueprint $table) {
            $table->id('id_eleveur');
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->unique();
            $table->string('adresse')->nullable();
            $table->string('telephone');
            $table->string('commune')->nullable();
            $table->boolean('compte_actif')->default(true);
            $table->unsignedBigInteger('id_utilisateur')->unique();
            $table->timestamps();

            $table->foreign('id_utilisateur')
                ->references('id_utilisateur')
                ->on('users')
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
        Schema::dropIfExists('eleveurs');
    }
}
