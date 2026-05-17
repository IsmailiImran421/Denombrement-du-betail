<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeIdComiteNullableInPvInscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pv_inscriptions', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['id_comite']);
            
            // Make the column nullable
            $table->unsignedBigInteger('id_comite')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('id_comite')
                ->references('id_comite')
                ->on('comites')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pv_inscriptions', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['id_comite']);
            
            // Make the column not nullable
            $table->unsignedBigInteger('id_comite')->nullable(false)->change();
            
            // Re-add the foreign key constraint
            $table->foreign('id_comite')
                ->references('id_comite')
                ->on('comites')
                ->onDelete('cascade');
        });
    }
}
