<?php

namespace App\Filament\Resources\PostResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class PostInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('id')
                    ->label('ID')
                    ->columnSpan(1),

                TextEntry::make('author.name')
                    ->label('Autor')
                    ->badge()
                    ->color('warning')
                    ->columnSpan(1),

                TextEntry::make('visibility')
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
                    ->columnSpan(1),

                TextEntry::make('created_at')
                    ->label('Publicado em')
                    ->dateTime('d/m/Y H:i')
                    ->columnSpan(1),

                TextEntry::make('reply_to_post_id')
                    ->label('Respondendo ao Post #')
                    ->placeholder('N/A')
                    ->columnSpan(1),

                TextEntry::make('content')
                    ->label('Conteúdo')
                    ->columnSpan(2)
                    ->markdown()
                    ->placeholder('Sem conteúdo disponível'),
            ]);
    }
}








