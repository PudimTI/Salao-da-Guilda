<?php

namespace App\Filament\Resources\TagResource\Schemas;

use App\Models\Tag;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class TagForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextInput::make('name')
                    ->label('Nome')
                    ->required()
                    ->maxLength(100)
                    ->unique(ignoreRecord: true)
                    ->placeholder('Ex.: Dungeons & Dragons'),

                Select::make('type')
                    ->label('Tipo')
                    ->options([
                        'post' => 'Post',
                        'campaign' => 'Campanha',
                        'general' => 'Geral',
                    ])
                    ->searchable()
                    ->placeholder('Selecione o tipo da tag')
                    ->columnSpan(1),

                Toggle::make('is_moderated')
                    ->label('Moderada?')
                    ->helperText('Tags moderadas precisam de aprovação antes de aparecerem publicamente.')
                    ->default(false)
                    ->inline(false)
                    ->columnSpan(1),

                Textarea::make('description')
                    ->label('Descrição')
                    ->rows(4)
                    ->maxLength(500)
                    ->placeholder('Descreva quando usar esta tag.')
                    ->columnSpan(2),

                TagsInput::make('synonyms')
                    ->label('Sinônimos')
                    ->placeholder('Adicionar sinônimos...')
                    ->helperText('Máximo de 10 sinônimos, cada um com até 100 caracteres.')
                    ->rules(['array', 'max:10'])
                    ->separator(',')
                    ->columnSpan(2),

                Placeholder::make('usage_count')
                    ->label('Uso total')
                    ->content(fn (?Tag $record): string => number_format($record?->usage_count ?? 0, 0, ',', '.'))
                    ->columnSpan(1)
                    ->hidden(fn (?Tag $record): bool => $record === null),

                Placeholder::make('updated_at')
                    ->label('Última atualização')
                    ->content(fn (?Tag $record): string => $record?->updated_at?->format('d/m/Y H:i') ?? '—')
                    ->columnSpan(1)
                    ->hidden(fn (?Tag $record): bool => $record === null),
            ]);
    }
}


