<?php

namespace App\Filament\Resources\ChatConversationResource\Tables;

use App\Filament\Resources\ChatConversationResource;
use App\Models\Conversation;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ChatConversationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('title')
                    ->label('Título')
                    ->wrap()
                    ->limit(60)
                    ->searchable(),

                TextColumn::make('type')
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
                    })
                    ->sortable(),

                TextColumn::make('campaign.name')
                    ->label('Campanha')
                    ->placeholder('—')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('participants_count')
                    ->label('Participantes')
                    ->counts('participants')
                    ->sortable(),

                TextColumn::make('messages_count')
                    ->label('Mensagens')
                    ->counts('messages')
                    ->sortable(),

                TextColumn::make('last_activity_at')
                    ->label('Última atividade')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Criada em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->modifyQueryUsing(fn (Builder $query) => $query
                ->withCount(['participants', 'messages'])
                ->with('campaign'))
            ->filters([
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options([
                        'campaign' => 'Campanha',
                        'direct' => 'Direto',
                    ]),

                SelectFilter::make('campaign_id')
                    ->label('Campanha')
                    ->relationship('campaign', 'name'),

                Filter::make('activity_between')
                    ->label('Período de atividade')
                    ->form([
                        DatePicker::make('from')->label('De'),
                        DatePicker::make('until')->label('Até'),
                    ])
                    ->query(fn (Builder $query, array $data) => $query
                        ->when($data['from'] ?? null, fn (Builder $q, $date) => $q->whereDate('last_activity_at', '>=', $date))
                        ->when($data['until'] ?? null, fn (Builder $q, $date) => $q->whereDate('last_activity_at', '<=', $date))),
            ])
            ->recordActions([])
            ->recordUrl(fn (Conversation $record) => ChatConversationResource::getUrl('view', ['record' => $record]))
            ->defaultSort('last_activity_at', 'desc')
            ->searchPlaceholder('Buscar por título, campanha ou ID...')
            ->paginationPageOptions([25, 50, 100])
            ->poll('60s');
    }
}

