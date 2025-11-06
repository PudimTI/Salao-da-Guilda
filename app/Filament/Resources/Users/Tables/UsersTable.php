<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                
                TextColumn::make('display_name')
                    ->label('Nome')
                    ->searchable()
                    ->sortable()
                    ->default('—')
                    ->formatStateUsing(fn ($record) => $record->display_name ?: $record->handle ?: $record->email),
                
                TextColumn::make('handle')
                    ->label('Handle')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),
                
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->icon('heroicon-m-envelope'),
                
                IconColumn::make('email_verified_at')
                    ->label('Verificado')
                    ->boolean()
                    ->sortable()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                
                TextColumn::make('role')
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
                    })
                    ->sortable(),
                
                TextColumn::make('status')
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
                    })
                    ->sortable()
                    ->searchable(),
                
                TextColumn::make('last_login_at')
                    ->label('Último Login')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable()
                    ->placeholder('Nunca'),
                
                TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                
                TextColumn::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Ativo',
                        'suspended' => 'Suspenso',
                        'banned' => 'Banido',
                    ]),
                
                SelectFilter::make('role')
                    ->label('Função')
                    ->options([
                        'user' => 'Usuário',
                        'moderator' => 'Moderador',
                        'admin' => 'Administrador',
                    ]),
                
                SelectFilter::make('email_verified_at')
                    ->label('Email Verificado')
                    ->options([
                        '1' => 'Verificado',
                        '0' => 'Não Verificado',
                    ])
                    ->query(function ($query, array $data) {
                        if ($data['value'] === '1') {
                            return $query->whereNotNull('email_verified_at');
                        } elseif ($data['value'] === '0') {
                            return $query->whereNull('email_verified_at');
                        }
                        return $query;
                    }),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc')
            ->searchPlaceholder('Buscar por nome, email ou handle...');
    }
}
