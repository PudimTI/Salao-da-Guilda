<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Adicionar campo handle único (nullable temporariamente)
            $table->string('handle')->nullable()->unique()->after('id');
            
            // Renomear password para password_hash
            $table->renameColumn('password', 'password_hash');
            
            // Adicionar campos de perfil
            $table->string('display_name')->nullable()->after('handle');
            $table->text('avatar_url')->nullable()->after('display_name');
            $table->text('bio')->nullable()->after('avatar_url');
            
            // Adicionar campo status com enum
            $table->enum('status', ['active', 'suspended', 'banned'])->default('active')->after('bio');
            
            // Adicionar campo last_login_at
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
        
        // Popular o campo handle para registros existentes
        DB::table('users')->whereNull('handle')->update([
            'handle' => DB::raw("'user_' || id")
        ]);
        
        // Tornar o campo handle NOT NULL após popular
        Schema::table('users', function (Blueprint $table) {
            $table->string('handle')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remover campos adicionados
            $table->dropColumn(['handle', 'display_name', 'avatar_url', 'bio', 'status', 'last_login_at']);
            
            // Renomear password_hash de volta para password
            $table->renameColumn('password_hash', 'password');
        });
    }
};
