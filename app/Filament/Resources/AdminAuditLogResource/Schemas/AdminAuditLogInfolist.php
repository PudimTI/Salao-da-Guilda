<?php

namespace App\Filament\Resources\AdminAuditLogResource\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AdminAuditLogInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextEntry::make('id')
                    ->label('ID')
                    ->columnSpan(1),

                TextEntry::make('admin.name')
                    ->label('Administrador')
                    ->badge()
                    ->color('warning')
                    ->columnSpan(1)
                    ->placeholder('—'),

                TextEntry::make('operation')
                    ->label('Operação')
                    ->badge()
                    ->color('info')
                    ->columnSpan(1),

                TextEntry::make('acted_at')
                    ->label('Executado em')
                    ->dateTime('d/m/Y H:i:s')
                    ->columnSpan(1),

                TextEntry::make('entity_type')
                    ->label('Entidade')
                    ->columnSpan(1),

                TextEntry::make('entity_id')
                    ->label('ID da Entidade')
                    ->columnSpan(1)
                    ->placeholder('—'),

                TextEntry::make('details')
                    ->label('Detalhes')
                    ->columnSpan(2)
                    ->markdown()
                    ->placeholder('—'),
            ]);
    }
}

