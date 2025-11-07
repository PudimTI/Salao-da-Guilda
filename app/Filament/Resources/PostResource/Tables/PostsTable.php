<?php

namespace App\Filament\Resources\PostResource\Tables;

use App\Models\Post;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('author.name')
                    ->label('Autor')
                    ->badge()
                    ->color('warning')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('content')
                    ->label('Conteúdo')
                    ->limit(80)
                    ->wrap()
                    ->searchable(),

                TextColumn::make('visibility')
                    ->label('Visibilidade')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'public' => 'success',
                        'friends' => 'info',
                        'private' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'public' => 'Pública',
                        'friends' => 'Amigos',
                        'private' => 'Privada',
                        default => ucfirst($state),
                    })
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Publicado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                IconColumn::make('reply_to_post_id')
                    ->label('É resposta?')
                    ->boolean()
                    ->trueIcon('heroicon-o-reply')
                    ->falseIcon('heroicon-o-chat-bubble-bottom-center-text')
                    ->color('info')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('visibility')
                    ->label('Visibilidade')
                    ->options([
                        'public' => 'Pública',
                        'friends' => 'Amigos',
                        'private' => 'Privada',
                    ]),

                SelectFilter::make('author_id')
                    ->label('Autor')
                    ->relationship('author', 'display_name')
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
            ->searchPlaceholder('Buscar por autor, conteúdo ou ID...')
            ->paginationPageOptions([25, 50, 100]);
    }
}

