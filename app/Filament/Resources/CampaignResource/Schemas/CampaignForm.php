<?php

namespace App\Filament\Resources\CampaignResource\Schemas;

use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CampaignForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('owner_id')
                    ->label('Mestre da campanha')
                    ->relationship('owner', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn (User $record): string => $record->name)
                    ->searchable(['display_name', 'handle', 'email'])
                    ->required()
                    ->columnSpan(2)
                    ->helperText('Selecione o usuário responsável pela campanha.')
                    ->default(fn () => auth()->id()),

                TextInput::make('name')
                    ->label('Título')
                    ->maxLength(150)
                    ->required()
                    ->columnSpan(2),

                TextInput::make('system')
                    ->label('Sistema de RPG')
                    ->maxLength(100)
                    ->placeholder('Ex: Dungeons & Dragons, Tormenta20...'),

                Select::make('type')
                    ->label('Formato')
                    ->options([
                        'digital' => 'Digital',
                        'presencial' => 'Presencial',
                    ])
                    ->nullable()
                    ->native(false),

                TextInput::make('city')
                    ->label('Cidade')
                    ->maxLength(100)
                    ->placeholder('Cidade ou região onde acontece'),

                Select::make('status')
                    ->label('Status')
                    ->options([
                        'open' => 'Aberta',
                        'active' => 'Em andamento',
                        'paused' => 'Pausada',
                        'closed' => 'Encerrada',
                    ])
                    ->default('open')
                    ->required(),

                Select::make('visibility')
                    ->label('Visibilidade')
                    ->options([
                        'public' => 'Pública',
                        'private' => 'Privada',
                    ])
                    ->default('public')
                    ->required(),

                Textarea::make('description')
                    ->label('Descrição detalhada')
                    ->rows(6)
                    ->maxLength(5000)
                    ->columnSpan(2),

                Textarea::make('rules')
                    ->label('Regras da campanha')
                    ->rows(6)
                    ->maxLength(5000)
                    ->placeholder('Informe requisitos, house rules ou combinados importantes.')
                    ->columnSpan(2),
            ]);
    }
}

