<?php

/**
 * Script para criar usuário administrador via Tinker
 * 
 * Uso: php artisan tinker
 * Depois copie e cole o código abaixo ou execute:
 * require 'CREATE_ADMIN_USER.php';
 */

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Dados do usuário admin
$adminData = [
    'handle' => 'admin',
    'email' => 'admin@salaodaguilda.com',
    'password_hash' => Hash::make('admin123'), // Altere esta senha!
    'display_name' => 'Administrador',
    'bio' => 'Administrador do sistema Salão da Guilda',
    'status' => 'active',
    'role' => 'admin',
    'email_verified_at' => now(),
];

// Verificar se já existe um admin com este email
$existingAdmin = User::where('email', $adminData['email'])->first();

if ($existingAdmin) {
    // Se existe, atualizar para admin
    $existingAdmin->update([
        'role' => 'admin',
        'status' => 'active',
    ]);
    echo "✓ Usuário existente atualizado para administrador!\n";
    echo "  ID: {$existingAdmin->id}\n";
    echo "  Email: {$existingAdmin->email}\n";
    echo "  Handle: {$existingAdmin->handle}\n";
    echo "  Role: {$existingAdmin->role}\n";
} else {
    // Criar novo usuário admin
    $admin = User::create($adminData);
    echo "✓ Usuário administrador criado com sucesso!\n";
    echo "  ID: {$admin->id}\n";
    echo "  Email: {$admin->email}\n";
    echo "  Handle: {$admin->handle}\n";
    echo "  Display Name: {$admin->display_name}\n";
    echo "  Role: {$admin->role}\n";
    echo "  Status: {$admin->status}\n";
    echo "\n⚠️  ATENÇÃO: A senha padrão é 'admin123' - ALTERE IMEDIATAMENTE!\n";
}

// Verificar se o usuário pode acessar o painel
if (isset($admin)) {
    $user = $admin;
} else {
    $user = $existingAdmin;
}

echo "\n";
echo "Testando permissões:\n";
echo "  - hasRole('admin'): " . ($user->hasRole('admin') ? '✓' : '✗') . "\n";
echo "  - isAdmin(): " . ($user->isAdmin() ? '✓' : '✗') . "\n";
echo "  - isModerator(): " . ($user->isModerator() ? '✓' : '✗') . "\n";

echo "\n";
echo "🎉 Usuário admin criado/atualizado com sucesso!\n";
echo "📝 Acesse o painel admin em: /sg_admin\n";
echo "🔐 Email: {$user->email}\n";
echo "🔑 Senha: admin123 (ALTERE IMEDIATAMENTE!)\n";

