<?php

namespace App\Filament\Resources\PostResource\Schemas;

use App\Models\Post;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('author_id')
                    ->label('Autor')
                    ->relationship('author', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn (User $record): string => $record->name)
                    ->searchable(['display_name', 'handle', 'email'])
                    ->required()
                    ->columnSpan(1)
                    ->helperText('Selecione o usuário responsável pelo post.'),

                Select::make('visibility')
                    ->label('Visibilidade')
                    ->options([
                        'public' => 'Pública',
                        'friends' => 'Amigos',
                        'private' => 'Privada',
                    ])
                    ->default('public')
                    ->required()
                    ->columnSpan(1),

                Textarea::make('content')
                    ->label('Conteúdo')
                    ->rows(8)
                    ->maxLength(5000)
                    ->required()
                    ->columnSpan(2)
                    ->helperText('Conteúdo que será exibido no feed. Suporta Markdown básico.'),

                TextInput::make('reply_to_post_id')
                    ->label('Resposta ao Post #')
                    ->numeric()
                    ->minValue(1)
                    ->nullable()
                    ->columnSpan(1)
                    ->helperText('Informe o ID do post original, se este for uma resposta.'),

                DateTimePicker::make('created_at')
                    ->label('Publicado em')
                    ->seconds(false)
                    ->timezone(config('app.timezone'))
                    ->default(now())
                    ->required()
                    ->columnSpan(1),
            ]);
    }
}








