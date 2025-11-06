<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Hash;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                // Informações Básicas
                TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->columnSpan(1),
                
                TextInput::make('handle')
                    ->label('Handle / Username')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(50)
                    ->helperText('Nome de usuário único')
                    ->columnSpan(1),
                
                TextInput::make('display_name')
                    ->label('Nome de Exibição')
                    ->maxLength(100)
                    ->columnSpan(2),

                // Autenticação
                TextInput::make('password')
                    ->label('Senha')
                    ->password()
                    ->required(fn ($livewire) => $livewire instanceof \Filament\Resources\Pages\CreateRecord)
                    ->dehydrated(false)
                    ->helperText('Deixe em branco para manter a senha atual ao editar')
                    ->columnSpan(1)
                    ->minLength(6)
                    ->visibleOn(['create', 'edit'])
                    ->afterStateUpdated(function ($state, callable $set) {
                        if (filled($state)) {
                            $set('password_confirmation', $state);
                        }
                    }),
                
                TextInput::make('password_confirmation')
                    ->label('Confirmar Senha')
                    ->password()
                    ->required(fn ($livewire) => $livewire instanceof \Filament\Resources\Pages\CreateRecord)
                    ->dehydrated(false)
                    ->same('password')
                    ->columnSpan(1)
                    ->visibleOn(['create', 'edit']),

                // Perfil
                Textarea::make('bio')
                    ->label('Biografia')
                    ->rows(3)
                    ->maxLength(500)
                    ->columnSpanFull(),
                
                TextInput::make('avatar_url')
                    ->label('URL do Avatar')
                    ->url()
                    ->maxLength(255)
                    ->helperText('URL completa da imagem de perfil')
                    ->columnSpanFull(),

                // Status e Permissões
                Select::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Ativo',
                        'suspended' => 'Suspenso',
                        'banned' => 'Banido',
                    ])
                    ->default('active')
                    ->required()
                    ->columnSpan(1),
                
                Select::make('role')
                    ->label('Função')
                    ->options([
                        'user' => 'Usuário',
                        'moderator' => 'Moderador',
                        'admin' => 'Administrador',
                    ])
                    ->default('user')
                    ->required()
                    ->columnSpan(1),
                
                Toggle::make('email_verified')
                    ->label('Email Verificado')
                    ->dehydrated(false)
                    ->default(fn ($record) => $record?->email_verified_at !== null)
                    ->afterStateUpdated(function ($state, callable $set, $livewire) {
                        if ($state) {
                            $set('email_verified_at', now());
                        } else {
                            $set('email_verified_at', null);
                        }
                    })
                    ->columnSpan(1),
                
                DateTimePicker::make('email_verified_at')
                    ->label('Email Verificado em')
                    ->dehydrated()
                    ->displayFormat('d/m/Y H:i')
                    ->hidden()
                    ->default(null)
                    ->columnSpan(1),

                // Informações Adicionais
                DateTimePicker::make('last_login_at')
                    ->label('Último Login')
                    ->disabled()
                    ->displayFormat('d/m/Y H:i')
                    ->columnSpan(2)
                    ->visibleOn(['view', 'edit']),
            ])
            ->columns(2);
    }
}
