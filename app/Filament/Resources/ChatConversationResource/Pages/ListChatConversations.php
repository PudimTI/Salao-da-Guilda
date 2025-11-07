<?php

namespace App\Filament\Resources\ChatConversationResource\Pages;

use App\Filament\Resources\ChatConversationResource;
use Filament\Resources\Pages\ListRecords;

class ListChatConversations extends ListRecords
{
    protected static string $resource = ChatConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}

