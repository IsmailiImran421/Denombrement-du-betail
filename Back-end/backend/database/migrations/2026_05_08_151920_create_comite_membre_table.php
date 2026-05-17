<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComiteMembreTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('comite_membre', function (Blueprint $table) {
            $table->unsignedBigInteger('id_comite');
            $table->unsignedBigInteger('id_membre');
            $table->timestamps();

            $table->primary(['id_comite', 'id_membre']);

            $table->foreign('id_comite')
                ->references('id_comite')
                ->on('comites')
                ->onDelete('cascade');

            $table->foreign('id_membre')
                ->references('id_membre')
                ->on('membres')
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
        Schema::dropIfExists('comite_membre');
    }
}
