<?php

namespace App\Filament\Resources\PostResource\Pages;

use App\Filament\Resources\PostResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use App\Services\AdminAuditLogger;

class EditPost extends EditRecord
{
    protected static string $resource = PostResource::class;

    protected array $auditPayload = [];

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make()
                ->after(function ($record) {
                    AdminAuditLogger::log('post.deleted', $record, [
                        'author_id' => $record->author_id,
                        'visibility' => $record->visibility,
                    ]);
                }),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (empty($data['reply_to_post_id'])) {
            $data['reply_to_post_id'] = null;
        }

        if (empty($data['created_at'])) {
            $data['created_at'] = now();
        }

        $this->auditPayload = $data;

        return $data;
    }

    protected function afterSave(): void
    {
        AdminAuditLogger::log('post.updated', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

