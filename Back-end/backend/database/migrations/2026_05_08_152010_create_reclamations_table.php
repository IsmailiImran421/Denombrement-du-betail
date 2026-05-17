<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReclamationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id('id_plainte');
            $table->string('sujet');
            $table->text('description');
            $table->dateTime('date_plainte');
            $table->unsignedBigInteger('id_eleveur');
            $table->timestamps();

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
        Schema::dropIfExists('reclamations');
    }
}
