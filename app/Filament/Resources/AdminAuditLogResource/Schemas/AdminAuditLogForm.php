<?php

namespace App\Filament\Resources\AdminAuditLogResource\Schemas;

use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AdminAuditLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('admin_id')
                    ->label('Administrador')
                    ->relationship('admin', 'display_name')
                    ->getOptionLabelFromRecordUsing(fn (User $record): string => $record->name)
                    ->disabled()
                    ->dehydrated(true)
                    ->columnSpan(1),

                TextInput::make('entity_type')
                    ->label('Tipo da Entidade')
                    ->disabled()
                    ->columnSpan(1),

                TextInput::make('entity_id')
                    ->label('ID da Entidade')
                    ->numeric()
                    ->disabled()
                    ->columnSpan(1),

                TextInput::make('operation')
                    ->label('Operação')
                    ->disabled()
                    ->columnSpan(1),

                DateTimePicker::make('acted_at')
                    ->label('Executado em')
                    ->seconds(false)
                    ->disabled()
                    ->columnSpan(1),

                Textarea::make('details')
                    ->label('Detalhes')
                    ->rows(8)
                    ->disabled()
                    ->columnSpan(2),
            ]);
    }
}








