<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Events\UserJoinedConversation;
use App\Events\UserLeftConversation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatService
{
    /**
     * Obter conversas do usuário
     */
    public function getUserConversations(int $userId, array $options = []): LengthAwarePaginator
    {
        $query = Conversation::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })
        ->with(['participants.user', 'campaign', 'messages' => function ($q) {
            $q->latest()->limit(1);
        }])
        ->orderBy('last_activity_at', 'desc');

        // Filtros
        if (isset($options['type']) && $options['type'] !== 'all') {
            $query->where('type', $options['type']);
        }

        if (isset($options['search'])) {
            $search = $options['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('participants.user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('handle', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $options['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Criar nova conversa
     */
    public function createConversation(array $data): Conversation
    {
        return DB::transaction(function () use ($data) {
            // Criar conversa
            $conversation = Conversation::create([
                'campaign_id' => $data['campaign_id'] ?? null,
                'type' => $data['type'] ?? 'dm',
                'title' => $data['title'] ?? null,
                'created_at' => now(),
                'last_activity_at' => now(),
            ]);

            // Adicionar participantes
            $participants = array_merge([$data['creator_id']], $data['participants']);
            $roles = ['owner']; // Primeiro é sempre owner
            $roles = array_merge($roles, array_fill(1, count($data['participants']), 'member'));

            foreach ($participants as $index => $userId) {
                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $userId,
                    'role' => $roles[$index],
                    'joined_at' => now(),
                ]);
            }

            return $conversation->load(['participants.user', 'campaign']);
        });
    }

    /**
     * Encontrar conversa DM existente
     */
    public function findExistingDM(int $userId1, int $userId2): ?Conversation
    {
        return Conversation::where('type', 'dm')
            ->whereHas('participants', function ($q) use ($userId1) {
                $q->where('user_id', $userId1);
            })
            ->whereHas('participants', function ($q) use ($userId2) {
                $q->where('user_id', $userId2);
            })
            ->whereDoesntHave('participants', function ($q) use ($userId1, $userId2) {
                $q->whereNotIn('user_id', [$userId1, $userId2]);
            })
            ->with(['participants.user', 'campaign'])
            ->first();
    }

    /**
     * Obter mensagens de uma conversa
     */
    public function getConversationMessages(int $conversationId, array $options = []): LengthAwarePaginator
    {
        $query = Message::where('conversation_id', $conversationId)
            ->with(['sender'])
            ->orderBy('created_at', 'desc');

        // Paginação
        if (isset($options['before'])) {
            $query->where('id', '<', $options['before']);
        }

        if (isset($options['after'])) {
            $query->where('id', '>', $options['after']);
        }

        $perPage = $options['per_page'] ?? 50;
        return $query->paginate($perPage);
    }

    /**
     * Enviar mensagem
     */
    public function sendMessage(array $data): Message
    {
        $message = Message::create([
            'conversation_id' => $data['conversation_id'],
            'sender_id' => $data['sender_id'],
            'content' => $data['content'],
            'media_url' => $data['media_url'] ?? null,
            'reply_to' => $data['reply_to'] ?? null,
            'created_at' => now(),
        ]);

        // Atualizar última atividade da conversa
        Conversation::where('id', $data['conversation_id'])
            ->update(['last_activity_at' => now()]);

        return $message->load('sender');
    }

    /**
     * Adicionar participante à conversa
     */
    public function addParticipant(int $conversationId, int $userId): void
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        ConversationParticipant::create([
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        // Disparar evento
        $user = User::findOrFail($userId);
        broadcast(new UserJoinedConversation($conversation, $user))->toOthers();
    }

    /**
     * Remover participante da conversa
     */
    public function removeParticipant(int $conversationId, int $userId): void
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = User::findOrFail($userId);
        
        ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();

        // Disparar evento
        broadcast(new UserLeftConversation($conversation, $user))->toOthers();
    }

    /**
     * Marcar mensagens como lidas
     */
    public function markMessagesAsRead(int $conversationId, int $userId): void
    {
        // Aqui você pode implementar um sistema de marcação de mensagens como lidas
        // Por exemplo, usando uma tabela message_reads ou atualizando um campo na conversa
        // Por enquanto, vamos apenas atualizar a última atividade
        Conversation::where('id', $conversationId)
            ->update(['last_activity_at' => now()]);
    }

    /**
     * Armazenar mídia de mensagem
     */
    public function storeMessageMedia(UploadedFile $file, int $conversationId): string
    {
        $path = "chat/conversation-{$conversationId}/" . time() . '_' . $file->getClientOriginalName();
        
        Storage::disk('public')->put($path, file_get_contents($file));
        
        return Storage::url($path);
    }

    /**
     * Deletar mídia de mensagem
     */
    public function deleteMessageMedia(string $mediaUrl): void
    {
        $path = str_replace(Storage::url(''), '', $mediaUrl);
        Storage::disk('public')->delete($path);
    }

    /**
     * Obter estatísticas de chat
     */
    public function getChatStats(int $userId): array
    {
        $conversationsCount = Conversation::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->count();

        $messagesCount = Message::whereHas('conversation.participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->count();

        $unreadCount = $this->getUnreadMessagesCount($userId);

        return [
            'conversations_count' => $conversationsCount,
            'messages_count' => $messagesCount,
            'unread_count' => $unreadCount,
        ];
    }

    /**
     * Obter contagem de mensagens não lidas
     */
    public function getUnreadMessagesCount(int $userId): int
    {
        // Implementar lógica de mensagens não lidas
        // Por enquanto, retornar 0
        return 0;
    }
}
