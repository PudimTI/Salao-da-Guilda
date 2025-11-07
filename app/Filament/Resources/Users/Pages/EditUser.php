<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Services\AdminAuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected array $auditPayload = [];

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make()
                ->after(function ($record) {
                    AdminAuditLogger::log('user.deleted', $record, [
                        'email' => $record->email,
                        'role' => $record->role,
                    ]);
                }),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Se password foi fornecido, atualizar password_hash
        if (isset($data['password']) && filled($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
            unset($data['password']);
            unset($data['password_confirmation']);
        } else {
            // Remover password do array se não foi preenchido
            unset($data['password']);
            unset($data['password_confirmation']);
        }

        $this->auditPayload = Arr::only($data, ['handle', 'email', 'role', 'status']);

        return $data;
    }

    protected function afterSave(): void
    {
        AdminAuditLogger::log('user.updated', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
