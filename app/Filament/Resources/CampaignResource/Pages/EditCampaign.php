<?php

namespace App\Filament\Resources\CampaignResource\Pages;

use App\Filament\Resources\CampaignResource;
use App\Services\AdminAuditLogger;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCampaign extends EditRecord
{
    protected static string $resource = CampaignResource::class;

    protected array $auditPayload = [];

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->after(function ($record) {
                    AdminAuditLogger::log('campaign.deleted', $record, [
                        'name' => $record->name,
                        'status' => $record->status,
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
        AdminAuditLogger::log('campaign.updated', $this->record, [
            'payload' => $this->auditPayload,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
