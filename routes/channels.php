<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privado para conversas
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Verificar se o usuário é participante da conversa
    return Conversation::where('id', $conversationId)
        ->whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->exists();
});

// Canais de teste do Pusher
Broadcast::channel('test-user-{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
