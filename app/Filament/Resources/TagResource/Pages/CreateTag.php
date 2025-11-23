<?php

namespace App\Filament\Resources\TagResource\Pages;

use App\Filament\Resources\TagResource;
use App\Services\AdminAuditLogger;
use Filament\Resources\Pages\CreateRecord;

class CreateTag extends CreateRecord
{
    protected static string $resource = TagResource::class;

    protected function afterCreate(): void
    {
        AdminAuditLogger::log('tag.created', $this->record, [
            'name' => $this->record->name,
            'type' => $this->record->type,
            'is_moderated' => $this->record->is_moderated,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}








