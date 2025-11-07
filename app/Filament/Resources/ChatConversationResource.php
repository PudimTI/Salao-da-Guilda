<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChatConversationResource\Pages;
use App\Filament\Resources\ChatConversationResource\Schemas\ChatConversationInfolist;
use App\Filament\Resources\ChatConversationResource\Tables\ChatConversationsTable;
use App\Models\Conversation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class ChatConversationResource extends Resource
{
    protected static ?string $model = Conversation::class;

    protected static ?string $navigationLabel = 'Conversas';

    protected static ?string $modelLabel = 'Conversa';

    protected static ?string $pluralModelLabel = 'Conversas';

    protected static ?int $navigationSort = 5;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static UnitEnum|string|null $navigationGroup = 'Controle';

    public static function table(Table $table): Table
    {
        return ChatConversationsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ChatConversationInfolist::configure($schema);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function canViewAny(): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChatConversations::route('/'),
            'view' => Pages\ViewChatConversation::route('/{record}'),
        ];
    }
}

