<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            // Remover campos duplicados que agora estão na tabela users
            $table->dropColumn(['display_name', 'avatar_url', 'bio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            // Recriar campos se necessário fazer rollback
            $table->string('display_name', 100)->nullable();
            $table->text('avatar_url')->nullable();
            $table->text('bio')->nullable();
        });
    }
};
