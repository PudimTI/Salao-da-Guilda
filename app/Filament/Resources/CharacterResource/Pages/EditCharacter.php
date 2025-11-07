<?php

namespace App\Filament\Resources\CharacterResource\Pages;

use App\Filament\Resources\CharacterResource;
use App\Services\AdminAuditLogger;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCharacter extends EditRecord
{
    protected static string $resource = CharacterResource::class;

    protected array $auditPayload = [];

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->after(function ($record) {
                    AdminAuditLogger::log('character.deleted', $record, [
                        'name' => $record->name,
                        'user_id' => $record->user_id,
                    ]);
                }),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $this->auditPayload = $data;

        return $data;
    }

    protected function afterSave(): void
    {
        AdminAuditLogger::log('character.updated', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }
}
