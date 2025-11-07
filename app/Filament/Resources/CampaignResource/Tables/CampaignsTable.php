<?php

namespace App\Filament\Resources\CampaignResource\Tables;

use App\Models\Campaign;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CampaignsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('name')
                    ->label('Título')
                    ->searchable()
                    ->sortable()
                    ->wrap()
                    ->limit(50),

                TextColumn::make('owner.name')
                    ->label('Mestre')
                    ->sortable()
                    ->searchable()
                    ->badge()
                    ->color('warning'),

                TextColumn::make('system')
                    ->label('Sistema')
                    ->sortable()
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('type')
                    ->label('Formato')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'digital' => 'info',
                        'presencial' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'digital' => 'Digital',
                        'presencial' => 'Presencial',
                        default => $state ?? '—',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('city')
                    ->label('Cidade')
                    ->sortable()
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'open' => 'info',
                        'active' => 'success',
                        'paused' => 'warning',
                        'closed' => 'gray',
                        default => 'primary',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'open' => 'Aberta',
                        'active' => 'Em andamento',
                        'paused' => 'Pausada',
                        'closed' => 'Encerrada',
                        default => ucfirst($state),
                    })
                    ->sortable(),

                IconColumn::make('visibility')
                    ->label('Visibilidade')
                    ->icon(fn (string $state): string => match ($state) {
                        'public' => 'heroicon-o-globe-alt',
                        'private' => 'heroicon-o-lock-closed',
                        default => 'heroicon-o-eye',
                    })
                    ->tooltip(fn (string $state): string => match ($state) {
                        'public' => 'Pública',
                        'private' => 'Privada',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'public' => 'success',
                        'private' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->label('Atualizada em')
                    ->dateTime('d/m/Y H:i')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'open' => 'Aberta',
                        'active' => 'Em andamento',
                        'paused' => 'Pausada',
                        'closed' => 'Encerrada',
                    ]),

                SelectFilter::make('visibility')
                    ->label('Visibilidade')
                    ->options([
                        'public' => 'Pública',
                        'private' => 'Privada',
                    ]),

                SelectFilter::make('system')
                    ->label('Sistema')
                    ->options(fn () => Campaign::query()
                        ->select('system')
                        ->whereNotNull('system')
                        ->distinct()
                        ->orderBy('system')
                        ->pluck('system', 'system')
                        ->toArray()),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->searchPlaceholder('Buscar por título, mestre, sistema ou cidade...')
            ->paginationPageOptions([25, 50, 100]);
    }
}

