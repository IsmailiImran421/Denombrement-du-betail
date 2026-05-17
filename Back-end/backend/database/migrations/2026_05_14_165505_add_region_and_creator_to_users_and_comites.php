<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRegionAndCreatorToUsersAndComites extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add region and created_by to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('region')->nullable()->after('role');
            $table->unsignedBigInteger('created_by')->nullable()->after('region');
        });

        // Add region and email/password to comites table (for committee login)
        Schema::table('comites', function (Blueprint $table) {
            $table->string('region')->nullable()->after('role');
            $table->string('email_comite')->nullable()->unique()->after('region');
            $table->string('password_comite')->nullable()->after('email_comite');
            $table->unsignedBigInteger('created_by')->nullable()->after('password_comite');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['region', 'created_by']);
        });

        Schema::table('comites', function (Blueprint $table) {
            $table->dropColumn(['region', 'email_comite', 'password_comite', 'created_by']);
        });
    }
}
