<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AdminAuditLogResource\Pages;
use App\Filament\Resources\AdminAuditLogResource\Schemas\AdminAuditLogForm;
use App\Filament\Resources\AdminAuditLogResource\Schemas\AdminAuditLogInfolist;
use App\Filament\Resources\AdminAuditLogResource\Tables\AdminAuditLogsTable;
use App\Models\AdminAuditLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class AdminAuditLogResource extends Resource
{
    protected static ?string $model = AdminAuditLog::class;

    protected static ?string $navigationLabel = 'Auditoria';

    protected static ?string $modelLabel = 'Log de Auditoria';

    protected static ?string $pluralModelLabel = 'Logs de Auditoria';

    protected static ?int $navigationSort = 10;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static UnitEnum|string|null $navigationGroup = 'Administração';

    public static function form(Schema $schema): Schema
    {
        return AdminAuditLogForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AdminAuditLogInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AdminAuditLogsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAdminAuditLogs::route('/'),
            'view' => Pages\ViewAdminAuditLog::route('/{record}'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }

    public static function canViewAny(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }
}

