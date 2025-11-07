<?php

namespace App\Filament\Resources\CampaignResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CampaignInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('name')
                    ->label('Título')
                    ->weight('bold')
                    ->columnSpan(2),

                TextEntry::make('owner.name')
                    ->label('Mestre responsável')
                    ->badge()
                    ->color('warning')
                    ->placeholder('Não informado'),

                TextEntry::make('system')
                    ->label('Sistema')
                    ->placeholder('Não informado'),

                TextEntry::make('type')
                    ->label('Formato')
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'digital' => 'Digital',
                        'presencial' => 'Presencial',
                        default => $state ?? 'Não informado',
                    }),

                TextEntry::make('city')
                    ->label('Cidade')
                    ->placeholder('Não informado'),

                TextEntry::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'open' => 'info',
                        'active' => 'success',
                        'paused' => 'warning',
                        'closed' => 'gray',
                        default => 'primary',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'open' => 'Aberta',
                        'active' => 'Em andamento',
                        'paused' => 'Pausada',
                        'closed' => 'Encerrada',
                        default => ucfirst($state),
                    }),

                TextEntry::make('visibility')
                    ->label('Visibilidade')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'public' => 'success',
                        'private' => 'danger',
                        default => 'primary',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'public' => 'Pública',
                        'private' => 'Privada',
                        default => ucfirst($state),
                    }),

                TextEntry::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i'),

                TextEntry::make('updated_at')
                    ->label('Atualizada em')
                    ->dateTime('d/m/Y H:i'),

                TextEntry::make('description')
                    ->label('Descrição')
                    ->columnSpan(2)
                    ->placeholder('Sem descrição informada'),

                TextEntry::make('rules')
                    ->label('Regras')
                    ->columnSpan(2)
                    ->placeholder('Sem regras cadastradas'),
            ]);
    }
}

