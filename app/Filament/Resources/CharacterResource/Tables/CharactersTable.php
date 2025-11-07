<?php

namespace App\Filament\Resources\CharacterResource\Tables;

use App\Models\Character;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CharactersTable
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
                    ->label('Nome')
                    ->searchable()
                    ->sortable()
                    ->wrap()
                    ->limit(60),

                TextColumn::make('user.name')
                    ->label('Jogador')
                    ->sortable()
                    ->searchable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('system')
                    ->label('Sistema')
                    ->sortable()
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('level')
                    ->label('Nível')
                    ->sortable()
                    ->numeric(),

                TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('system')
                    ->label('Sistema')
                    ->options(fn () => Character::query()
                        ->select('system')
                        ->whereNotNull('system')
                        ->distinct()
                        ->orderBy('system')
                        ->pluck('system', 'system')
                        ->toArray()),

                SelectFilter::make('user_id')
                    ->label('Jogador')
                    ->relationship('user', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->name),
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
            ->searchPlaceholder('Buscar por nome, jogador ou sistema...')
            ->paginationPageOptions([25, 50, 100]);
    }
}

