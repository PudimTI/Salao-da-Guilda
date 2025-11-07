<?php

namespace App\Filament\Resources\ReportResource\Pages;

use App\Filament\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportService;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class EditReport extends EditRecord
{
    protected static string $resource = ReportResource::class;

    protected function getRedirectUrl(): string
    {
        return static::getUrl('index');
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        /** @var Report $record */
        $record = $this->getRecord();

        $record->loadMissing(['target', 'reporter', 'handledBy']);

        if ($record->target_type === 'user' && $record->target) {
            $data['target_user_status'] = $record->target->status;
        }

        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var Report $record */
        $record = app(ReportService::class)->updateStatus(
            $record,
            $data['status'],
            $data['resolution_notes'] ?? null,
            Auth::user(),
            $data['target_user_status'] ?? null,
        );

        return $record;
    }
}


