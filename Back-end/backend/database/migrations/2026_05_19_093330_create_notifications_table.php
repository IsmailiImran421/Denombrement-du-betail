<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->unsignedBigInteger('id_comite')->nullable();
            $table->string('titre');
            $table->text('message');
            $table->string('type_tache')->nullable(); // 'inscription', 'collection', 'bouclage', 'validation'
            $table->unsignedBigInteger('id_reference')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamps();

            $table->foreign('id_utilisateur')
                ->references('id_utilisateur')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('id_comite')
                ->references('id_comite')
                ->on('comites')
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
        Schema::dropIfExists('notifications');
    }
}

