<?php

namespace App\Filament\Resources\ChatConversationResource\Tables;

use App\Models\Message;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Forms\Components\DatePicker;

class ConversationMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('sender.name')
                    ->label('Remetente')
                    ->badge()
                    ->color('info')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('content')
                    ->label('Mensagem')
                    ->wrap()
                    ->limit(120)
                    ->searchable(),

                IconColumn::make('media_url')
                    ->label('Anexo')
                    ->boolean()
                    ->trueIcon('heroicon-o-paper-clip')
                    ->falseIcon('heroicon-o-minus')
                    ->color('warning')
                    ->sortable(),

                TextColumn::make('reply_to')
                    ->label('Resposta a')
                    ->placeholder('—')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Enviada em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('edited_at')
                    ->label('Editada em')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Filter::make('date_range')
                    ->label('Período')
                    ->form([
                        DatePicker::make('from')->label('De'),
                        DatePicker::make('until')->label('Até'),
                    ])
                    ->query(fn (Builder $query, array $data) => $query
                        ->when($data['from'] ?? null, fn (Builder $q, $date) => $q->whereDate('created_at', '>=', $date))
                        ->when($data['until'] ?? null, fn (Builder $q, $date) => $q->whereDate('created_at', '<=', $date))),
            ])
            ->recordActions([])
            ->actions([])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc')
            ->searchPlaceholder('Buscar por remetente ou conteúdo...')
            ->paginationPageOptions([25, 50, 100])
            ->poll('30s');
    }
}

