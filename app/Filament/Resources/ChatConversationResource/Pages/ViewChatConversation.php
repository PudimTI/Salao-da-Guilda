<?php

namespace App\Filament\Resources\ChatConversationResource\Pages;

use App\Filament\Resources\ChatConversationResource;
use App\Filament\Resources\ChatConversationResource\Tables\ConversationMessagesTable;
use Filament\Resources\Pages\ViewRecord;
use Filament\Tables\Table;

class ViewChatConversation extends ViewRecord
{
    protected static string $resource = ChatConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function table(Table $table): Table
    {
        return ConversationMessagesTable::configure(
            $table
                ->query(fn () => $this->record->messages()->with(['sender', 'repliedTo'])->getQuery())
        );
    }
}

