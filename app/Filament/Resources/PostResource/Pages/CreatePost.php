<?php

namespace App\Filament\Resources\PostResource\Pages;

use App\Filament\Resources\PostResource;
use Filament\Resources\Pages\CreateRecord;
use App\Services\AdminAuditLogger;

class CreatePost extends CreateRecord
{
    protected static string $resource = PostResource::class;

    protected array $auditPayload = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if (empty($data['created_at'])) {
            $data['created_at'] = now();
        }

        if (empty($data['reply_to_post_id'])) {
            $data['reply_to_post_id'] = null;
        }

        $this->auditPayload = $data;

        return $data;
    }

    protected function afterCreate(): void
    {
        AdminAuditLogger::log('post.created', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

