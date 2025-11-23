<?php

namespace App\Filament\Resources\ChatConversationResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class ChatConversationInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('id')
                    ->label('ID')
                    ->columnSpan(1),

                TextEntry::make('title')
                    ->label('Título')
                    ->columnSpan(2)
                    ->placeholder('—'),

                TextEntry::make('type')
                    ->label('Tipo')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'campaign' => 'warning',
                        'direct' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'campaign' => 'Campanha',
                        'direct' => 'Direto',
                        default => ucfirst($state),
                    }),

                TextEntry::make('campaign.name')
                    ->label('Campanha')
                    ->placeholder('—'),

                TextEntry::make('participants_count')
                    ->label('Participantes')
                    ->state(fn ($record) => $record->participants()->count())
                    ->numeric(),

                TextEntry::make('messages_count')
                    ->label('Mensagens')
                    ->state(fn ($record) => $record->messages()->count())
                    ->numeric(),

                TextEntry::make('participants_list')
                    ->label('Participantes')
                    ->state(fn ($record) => $record->participants()->get()->map(fn ($user) => $user->name)->join(', '))
                    ->placeholder('—')
                    ->columnSpan(2),

                TextEntry::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i'),

                TextEntry::make('last_activity_at')
                    ->label('Última atividade')
                    ->dateTime('d/m/Y H:i'),
            ]);
    }
}








