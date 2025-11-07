<?php

namespace App\Filament\Resources\CharacterResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CharacterInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('name')
                    ->label('Nome')
                    ->weight('bold')
                    ->columnSpan(2),

                TextEntry::make('user.name')
                    ->label('Jogador')
                    ->badge()
                    ->color('info')
                    ->placeholder('Não informado'),

                TextEntry::make('system')
                    ->label('Sistema')
                    ->placeholder('Não informado'),

                TextEntry::make('level')
                    ->label('Nível')
                    ->numeric(),

                TextEntry::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i'),

                TextEntry::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i'),

                TextEntry::make('summary')
                    ->label('Resumo')
                    ->columnSpan(2)
                    ->placeholder('Sem resumo informado'),

                TextEntry::make('backstory')
                    ->label('História completa')
                    ->columnSpan(2)
                    ->placeholder('Sem história registrada'),
            ]);
    }
}

