<?php

namespace App\Filament\Resources\AdminAuditLogResource\Tables;

use App\Models\AdminAuditLog;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AdminAuditLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('admin.name')
                    ->label('Administrador')
                    ->formatStateUsing(fn ($state, AdminAuditLog $record) => $record->admin?->name ?? '—')
                    ->badge()
                    ->color('warning')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('operation')
                    ->label('Operação')
                    ->badge()
                    ->color('info')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('entity_type')
                    ->label('Entidade')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('entity_id')
                    ->label('ID da Entidade')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('acted_at')
                    ->label('Executado em')
                    ->dateTime('d/m/Y H:i:s')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('admin_id')
                    ->label('Administrador')
                    ->relationship('admin', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->name),

                SelectFilter::make('entity_type')
                    ->label('Entidade')
                    ->options(fn () => AdminAuditLog::query()
                        ->select('entity_type')
                        ->whereNotNull('entity_type')
                        ->distinct()
                        ->orderBy('entity_type')
                        ->pluck('entity_type', 'entity_type')
                        ->toArray()),

                SelectFilter::make('operation')
                    ->label('Operação')
                    ->options(fn () => AdminAuditLog::query()
                        ->select('operation')
                        ->whereNotNull('operation')
                        ->distinct()
                        ->orderBy('operation')
                        ->pluck('operation', 'operation')
                        ->toArray()),

                Filter::make('acted_between')
                    ->label('Período')
                    ->form([
                        DatePicker::make('from')->label('De'),
                        DatePicker::make('until')->label('Até'),
                    ])
                    ->query(fn (Builder $query, array $data) => $query
                        ->when($data['from'] ?? null, fn (Builder $q, $date) => $q->whereDate('acted_at', '>=', $date))
                        ->when($data['until'] ?? null, fn (Builder $q, $date) => $q->whereDate('acted_at', '<=', $date))),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->bulkActions([])
            ->defaultSort('acted_at', 'desc')
            ->searchPlaceholder('Buscar por administrador, operação ou entidade...')
            ->paginationPageOptions([25, 50, 100])
            ->poll('60s');
    }
}

