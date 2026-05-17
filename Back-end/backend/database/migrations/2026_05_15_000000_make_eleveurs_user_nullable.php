<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('eleveurs', function (Blueprint $table) {
            $table->unsignedBigInteger('id_utilisateur')->nullable()->change();
            $table->boolean('compte_actif')->default(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('eleveurs', function (Blueprint $table) {
            $table->unsignedBigInteger('id_utilisateur')->nullable(false)->change();
            $table->boolean('compte_actif')->default(true)->change();
        });
    }
};
