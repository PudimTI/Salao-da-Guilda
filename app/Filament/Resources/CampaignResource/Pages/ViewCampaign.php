<?php

namespace App\Filament\Resources\CampaignResource\Pages;

use App\Filament\Resources\CampaignResource;
use App\Services\AdminAuditLogger;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCampaign extends ViewRecord
{
    protected static string $resource = CampaignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\DeleteAction::make()
                ->after(function ($record) {
                    AdminAuditLogger::log('campaign.deleted', $record, [
                        'name' => $record->name,
                        'status' => $record->status,
                    ]);
                }),
        ];
    }
}
