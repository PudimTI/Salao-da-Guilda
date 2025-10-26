<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\ChatService;
use App\Events\MessageSent;
use App\Events\UserTyping;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Listar mensagens de uma conversa
     */
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é participante da conversa
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        $perPage = $request->get('per_page', 50);
        $before = $request->get('before'); // Para paginação
        $after = $request->get('after'); // Para paginação

        $messages = $this->chatService->getConversationMessages($conversation->id, [
            'per_page' => $perPage,
            'before' => $before,
            'after' => $after
        ]);

        return response()->json([
            'success' => true,
            'data' => $messages,
            'message' => 'Mensagens recuperadas com sucesso'
        ]);
    }

    /**
     * Enviar mensagem
     */
    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'content' => 'required_without:media|string|max:5000',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mp3,pdf,doc,docx|max:10240', // 10MB
            'reply_to' => 'nullable|integer|exists:messages,id'
        ]);

        $user = Auth::user();
        
        // Verificar se o usuário é participante da conversa
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        try {
            $content = $request->get('content');
            $mediaUrl = null;
            $replyTo = $request->get('reply_to');

            // Processar mídia se enviada
            if ($request->hasFile('media')) {
                $file = $request->file('media');
                $mediaUrl = $this->chatService->storeMessageMedia($file, $conversation->id);
            }

            // Criar mensagem
            $message = $this->chatService->sendMessage([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $content,
                'media_url' => $mediaUrl,
                'reply_to' => $replyTo
            ]);

            // Disparar evento de broadcasting
            broadcast(new MessageSent($message))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Mensagem enviada com sucesso'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar mensagem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Editar mensagem
     */
    public function update(Request $request, Message $message): JsonResponse
    {
        $user = Auth::user();

        // Verificar se o usuário é o autor da mensagem
        if ($message->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sem permissão para editar esta mensagem'
            ], 403);
        }

        $request->validate([
            'content' => 'required|string|max:5000'
        ]);

        try {
            $message->update([
                'content' => $request->get('content'),
                'edited_at' => now()
            ]);

            // Disparar evento de atualização
            broadcast(new MessageSent($message->fresh()))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Mensagem editada com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao editar mensagem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar mensagem
     */
    public function destroy(Message $message): JsonResponse
    {
        $user = Auth::user();

        // Verificar se o usuário é o autor da mensagem ou admin da conversa
        $conversation = $message->conversation;
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        
        if ($message->sender_id !== $user->id && 
            (!$participant || !in_array($participant->role, ['admin', 'owner']))) {
            return response()->json([
                'success' => false,
                'message' => 'Sem permissão para deletar esta mensagem'
            ], 403);
        }

        try {
            // Remover mídia se existir
            if ($message->media_url) {
                $this->chatService->deleteMessageMedia($message->media_url);
            }

            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mensagem deletada com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar mensagem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar mensagens como lidas
     */
    public function markAsRead(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é participante da conversa
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        try {
            $this->chatService->markMessagesAsRead($conversation->id, $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Mensagens marcadas como lidas'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao marcar mensagens como lidas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Indicar que usuário está digitando
     */
    public function typing(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é participante da conversa
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        $isTyping = $request->get('is_typing', true);

        // Disparar evento de typing
        broadcast(new UserTyping($conversation, $user, $isTyping))->toOthers();

        return response()->json([
            'success' => true,
            'message' => $isTyping ? 'Indicando que está digitando' : 'Parou de digitar'
        ]);
    }
}
