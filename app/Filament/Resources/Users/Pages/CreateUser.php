<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Services\AdminAuditLogger;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected array $auditPayload = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Acessar o valor do password diretamente do formulário (mesmo com dehydrated=false)
        $password = $this->form->getState()['password'] ?? null;
        
        // Mapear password para password_hash se fornecido
        if ($password && filled($password)) {
            $data['password_hash'] = Hash::make($password);
        } else {
            // Se não fornecido, definir um padrão ou lançar erro
            throw new \Illuminate\Validation\ValidationException(
                validator([], ['password' => 'required']),
                ['password' => ['A senha é obrigatória.']]
            );
        }

        // Garantir que password e password_confirmation não sejam enviados
        unset($data['password']);
        unset($data['password_confirmation']);

        $this->auditPayload = Arr::only($data, ['handle', 'email', 'role', 'status']);

        return $data;
    }

    protected function afterCreate(): void
    {
        AdminAuditLogger::log('user.created', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
