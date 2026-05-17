<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePvCollectionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pv_collections', function (Blueprint $table) {
            $table->unsignedBigInteger('id_rapport')->primary();
            $table->integer('total_animaux')->default(0);
            $table->integer('total_moutons_males')->default(0);
            $table->integer('total_moutons_femmelles')->default(0);
            $table->integer('total_vaches_males')->default(0);
            $table->integer('total_vaches_femmelles')->default(0);
            $table->integer('total_chevres_males')->default(0);
            $table->integer('total_chevres_femmelles')->default(0);
            $table->integer('total_chamelles_males')->default(0);
            $table->integer('total_chamelles_femmelles')->default(0);
            $table->timestamps();

            $table->foreign('id_rapport')
                ->references('id_rapport')
                ->on('pv_inscriptions')
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
        Schema::dropIfExists('pv_collections');
    }
}
