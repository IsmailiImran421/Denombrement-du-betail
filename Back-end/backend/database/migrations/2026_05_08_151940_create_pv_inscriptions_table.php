<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePvInscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pv_inscriptions', function (Blueprint $table) {
            $table->id('id_rapport');
            $table->dateTime('date_generation');
            $table->unsignedBigInteger('id_comite');
            $table->unsignedBigInteger('id_eleveur')->unique();
            $table->timestamps();

            $table->foreign('id_comite')
                ->references('id_comite')
                ->on('comites')
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
        Schema::dropIfExists('pv_inscriptions');
    }
}
