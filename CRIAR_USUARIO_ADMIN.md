# Como Criar Usuário Admin - Salão da Guilda

## ⚠️ Problema Identificado

O arquivo `app/Providers/Filament/SgAdminPanelProvider.php` tem linhas problemáticas que precisam ser removidas antes de executar a migration.

## 📋 Passo a Passo

### 1. Corrigir o Provider do Filament

**Edite o arquivo:** `app/Providers/Filament/SgAdminPanelProvider.php`

**Remova estas linhas (linhas 58-59):**
```php
            ->authGuard('web')
            ->passwordBroker('users');
```

**O arquivo deve terminar assim:**
```php
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
```

### 2. Executar a Migration

Execute no terminal:
```bash
php artisan migrate --path=database/migrations/2025_01_15_000000_add_role_to_users_table.php
```

Isso adicionará o campo `role` na tabela `users` com valores: `user`, `admin`, `moderator`.

### 3. Criar Usuário Admin via Tinker

Execute o Tinker:
```bash
php artisan tinker
```

Depois cole e execute este código:

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Criar usuário admin
$admin = User::firstOrCreate(
    ['email' => 'admin@salaodaguilda.com'],
    [
        'handle' => 'admin',
        'email' => 'admin@salaodaguilda.com',
        'password_hash' => Hash::make('admin123'),
        'display_name' => 'Administrador',
        'bio' => 'Administrador do sistema Salão da Guilda',
        'status' => 'active',
        'role' => 'admin',
        'email_verified_at' => now(),
    ]
);

// Se o usuário já existir, atualizar role para admin
if ($admin->role !== 'admin') {
    $admin->update(['role' => 'admin', 'status' => 'active']);
}

echo "✓ Usuário admin criado/atualizado!\n";
echo "ID: {$admin->id}\n";
echo "Email: {$admin->email}\n";
echo "Handle: {$admin->handle}\n";
echo "Role: {$admin->role}\n";
echo "\nTestando permissões:\n";
echo "hasRole('admin'): " . ($admin->hasRole('admin') ? 'SIM' : 'NÃO') . "\n";
echo "isAdmin(): " . ($admin->isAdmin() ? 'SIM' : 'NÃO') . "\n";
```

### 4. Verificar Usuários Admin

Para verificar todos os usuários admin:

```php
$admins = User::where('role', 'admin')->get();
foreach ($admins as $admin) {
    echo "ID: {$admin->id} | Email: {$admin->email} | Handle: {$admin->handle}\n";
}
```

### 5. Atualizar Usuário Existente para Admin

Se você já tem um usuário e quer torná-lo admin:

```php
$user = User::where('email', 'seu_email@exemplo.com')->first();
if ($user) {
    $user->update(['role' => 'admin', 'status' => 'active']);
    echo "Usuário {$user->email} atualizado para admin!\n";
}
```

## 🔐 Dados de Acesso

Após criar o usuário admin:

- **URL do Painel:** `/sg_admin`
- **Email:** `admin@salaodaguilda.com`
- **Senha:** `admin123` ⚠️ **ALTERE IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!**

## ✅ Verificações Implementadas

O modelo User agora possui os seguintes métodos:

- `hasRole(string $role): bool` - Verifica se o usuário possui um role específico
- `isAdmin(): bool` - Verifica se o usuário é administrador
- `isModerator(): bool` - Verifica se o usuário é moderador ou admin
- `canAccessPanel(\Filament\Panel $panel): bool` - Verifica acesso ao painel Filament

## 📝 Resumo das Mudanças

1. ✅ Migration criada: `2025_01_15_000000_add_role_to_users_table.php`
2. ✅ Modelo User atualizado com campo `role` no fillable
3. ✅ Métodos `hasRole()`, `isAdmin()`, `isModerator()`, `canAccessPanel()` implementados
4. ⚠️ Provider do Filament precisa ser corrigido manualmente (remover linhas problemáticas)

## 🎯 Próximos Passos

Após criar o usuário admin:

1. Acesse `/sg_admin` e faça login
2. Altere a senha padrão
3. Configure as permissões do Filament se necessário
4. Teste o acesso aos recursos administrativos

