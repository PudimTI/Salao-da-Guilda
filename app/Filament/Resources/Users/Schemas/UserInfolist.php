<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class UserInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                // Informações Básicas
                TextEntry::make('display_name')
                    ->label('Nome de Exibição')
                    ->default('—'),
                
                TextEntry::make('handle')
                    ->label('Handle / Username')
                    ->badge()
                    ->color('info'),
                
                TextEntry::make('email')
                    ->label('Email')
                    ->copyable()
                    ->icon('heroicon-m-envelope'),
                
                IconEntry::make('email_verified_at')
                    ->label('Email Verificado')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                // Perfil
                TextEntry::make('bio')
                    ->label('Biografia')
                    ->placeholder('Nenhuma biografia definida')
                    ->columnSpanFull(),
                
                TextEntry::make('avatar_url')
                    ->label('URL do Avatar')
                    ->url(fn ($state) => $state)
                    ->openUrlInNewTab()
                    ->placeholder('Nenhum avatar definido')
                    ->columnSpanFull(),

                // Status e Permissões
                TextEntry::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'suspended' => 'warning',
                        'banned' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'active' => 'Ativo',
                        'suspended' => 'Suspenso',
                        'banned' => 'Banido',
                        default => $state,
                    }),
                
                TextEntry::make('role')
                    ->label('Função')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'admin' => 'danger',
                        'moderator' => 'warning',
                        'user' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'admin' => 'Administrador',
                        'moderator' => 'Moderador',
                        'user' => 'Usuário',
                        default => $state,
                    }),
                
                TextEntry::make('email_verified_at')
                    ->label('Email Verificado em')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Não verificado'),

                // Atividade
                TextEntry::make('last_login_at')
                    ->label('Último Login')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Nunca fez login')
                    ->icon('heroicon-m-clock'),
                
                TextEntry::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i')
                    ->icon('heroicon-m-calendar'),
                
                TextEntry::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i')
                    ->icon('heroicon-m-arrow-path'),
            ])
            ->columns(2);
    }
}
