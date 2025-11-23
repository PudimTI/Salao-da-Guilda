<?php

namespace App\Filament\Resources\TagResource\Pages;

use App\Filament\Resources\TagResource;
use App\Services\AdminAuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditTag extends EditRecord
{
    protected static string $resource = TagResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make()
                ->requiresConfirmation()
                ->after(fn ($record) => AdminAuditLogger::log('tag.deleted', $record, [
                    'name' => $record->name,
                    'type' => $record->type,
                ])),
        ];
    }

    protected function afterSave(): void
    {
        AdminAuditLogger::log('tag.updated', $this->record, [
            'name' => $this->record->name,
            'type' => $this->record->type,
            'is_moderated' => $this->record->is_moderated,
            'synonyms' => $this->record->synonyms,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}








