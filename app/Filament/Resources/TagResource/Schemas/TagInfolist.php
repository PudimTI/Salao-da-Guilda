<?php

namespace App\Filament\Resources\TagResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\TagsEntry;
use Filament\Schemas\Schema;

class TagInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('name')
                    ->label('Nome')
                    ->columnSpan(1),

                TextEntry::make('type')
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
                    ->columnSpan(1),

                TextEntry::make('usage_count')
                    ->label('Uso total')
                    ->badge()
                    ->columnSpan(1),

                TextEntry::make('is_moderated')
                    ->label('Moderada?')
                    ->badge()
                    ->color(fn (?bool $state): string => $state ? 'warning' : 'success')
                    ->formatStateUsing(fn (?bool $state): string => $state ? 'Sim' : 'Não')
                    ->columnSpan(1),

                TagsEntry::make('synonyms')
                    ->label('Sinônimos')
                    ->placeholder('Nenhum sinônimo cadastrado')
                    ->columnSpan(2),

                TextEntry::make('description')
                    ->label('Descrição')
                    ->columnSpan(2)
                    ->markdown()
                    ->placeholder('Sem descrição informada.'),

                TextEntry::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i')
                    ->columnSpan(1),

                TextEntry::make('updated_at')
                    ->label('Atualizada em')
                    ->dateTime('d/m/Y H:i')
                    ->columnSpan(1),
            ]);
    }
}


