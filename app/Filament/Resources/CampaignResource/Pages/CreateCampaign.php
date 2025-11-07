<?php

namespace App\Filament\Resources\CampaignResource\Pages;

use App\Filament\Resources\CampaignResource;
use Filament\Resources\Pages\CreateRecord;
use App\Services\AdminAuditLogger;

class CreateCampaign extends CreateRecord
{
    protected static string $resource = CampaignResource::class;

    protected array $auditPayload = [];

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->auditPayload = $data;

        return $data;
    }

    protected function afterCreate(): void
    {
        AdminAuditLogger::log('campaign.created', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
