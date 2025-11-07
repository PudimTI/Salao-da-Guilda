<?php

namespace App\Filament\Resources\CharacterResource\Pages;

use App\Filament\Resources\CharacterResource;
use App\Services\AdminAuditLogger;
use Filament\Resources\Pages\CreateRecord;

class CreateCharacter extends CreateRecord
{
    protected static string $resource = CharacterResource::class;

    protected array $auditPayload = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->auditPayload = $data;

        return $data;
    }

    protected function afterCreate(): void
    {
        AdminAuditLogger::log('character.created', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }
}
