<?php

namespace App\Filament\Resources\CharacterResource\Schemas;

use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CharacterForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('user_id')
                    ->label('Jogador')
                    ->relationship('user', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn (User $record): string => $record->name)
                    ->searchable(['display_name', 'handle', 'email'])
                    ->required()
                    ->helperText('Selecione o jogador proprietário do personagem.')
                    ->columnSpan(2),

                TextInput::make('name')
                    ->label('Nome do personagem')
                    ->maxLength(150)
                    ->required()
                    ->columnSpan(2),

                TextInput::make('system')
                    ->label('Sistema de RPG')
                    ->maxLength(100)
                    ->placeholder('Ex: D&D 5e, Tormenta20...'),

                TextInput::make('level')
                    ->label('Nível')
                    ->numeric()
                    ->minValue(1)
                    ->default(1),

                Textarea::make('summary')
                    ->label('Resumo')
                    ->rows(4)
                    ->maxLength(1000)
                    ->placeholder('Breve descrição do personagem')
                    ->columnSpan(2),

                Textarea::make('backstory')
                    ->label('História completa')
                    ->rows(8)
                    ->maxLength(5000)
                    ->placeholder('Detalhes, motivações e história do personagem')
                    ->columnSpan(2),
            ]);
    }
}

