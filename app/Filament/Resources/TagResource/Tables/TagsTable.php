<?php

namespace App\Filament\Resources\TagResource\Tables;

use App\Models\Tag;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TagsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nome')
                    ->searchable()
                    ->sortable()
                    ->limit(40),

                TextColumn::make('type')
                    ->label('Tipo')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'post' => 'info',
                        'campaign' => 'success',
                        'general' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'post' => 'Post',
                        'campaign' => 'Campanha',
                        'general' => 'Geral',
                        default => $state ?? '—',
                    })
                    ->sortable(),

                TextColumn::make('usage_count')
                    ->label('Uso total')
                    ->sortable()
                    ->alignCenter()
                    ->badge()
                    ->color('primary'),

                IconColumn::make('is_moderated')
                    ->label('Moderada')
                    ->boolean()
                    ->trueIcon('heroicon-o-shield-check')
                    ->falseIcon('heroicon-o-shield-exclamation')
                    ->trueColor('warning')
                    ->falseColor('success'),

                TextColumn::make('updated_at')
                    ->label('Atualizada em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options([
                        'post' => 'Post',
                        'campaign' => 'Campanha',
                        'general' => 'Geral',
                    ]),

                TernaryFilter::make('is_moderated')
                    ->label('Moderada')
                    ->placeholder('Todas')
                    ->trueLabel('Somente moderadas')
                    ->falseLabel('Somente não moderadas'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make()
                    ->requiresConfirmation()
                    ->modalHeading('Excluir tag')
                    ->modalDescription('Tem certeza que deseja excluir esta tag? Essa ação removerá o relacionamento com posts e campanhas.'),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->requiresConfirmation()
                        ->modalHeading('Excluir tags selecionadas')
                        ->modalDescription('Tem certeza que deseja excluir as tags selecionadas? Essa ação removerá o relacionamento com posts e campanhas.'),
                ]),
            ])
            ->modifyQueryUsing(fn (Builder $query) => $query->select('id', 'name', 'type', 'usage_count', 'is_moderated', 'created_at', 'updated_at'))
            ->defaultSort('usage_count', 'desc')
            ->searchPlaceholder('Buscar por nome ou descrição...')
            ->paginationPageOptions([25, 50, 100]);
    }
}


