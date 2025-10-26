<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\User;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Listar conversas do usuário autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $type = $request->get('type', 'all'); // all, dm, group, campaign

        $conversations = $this->chatService->getUserConversations($user->id, [
            'per_page' => $perPage,
            'search' => $search,
            'type' => $type
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversations,
            'message' => 'Conversas recuperadas com sucesso'
        ]);
    }

    /**
     * Criar nova conversa
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'participants' => 'required|array|min:1',
            'participants.*' => 'integer|exists:users,id',
            'title' => 'nullable|string|max:150',
            'type' => 'string|in:dm,group,campaign',
            'campaign_id' => 'nullable|integer|exists:campaigns,id'
        ]);

        try {
            $user = Auth::user();
            $participants = $request->get('participants');
            $title = $request->get('title');
            $type = $request->get('type', 'dm');
            $campaignId = $request->get('campaign_id');

            // Verificar se já existe conversa DM entre os usuários
            if ($type === 'dm' && count($participants) === 1) {
                $existingConversation = $this->chatService->findExistingDM($user->id, $participants[0]);
                if ($existingConversation) {
                    return response()->json([
                        'success' => true,
                        'data' => $existingConversation,
                        'message' => 'Conversa existente encontrada'
                    ]);
                }
            }

            $conversation = $this->chatService->createConversation([
                'creator_id' => $user->id,
                'participants' => $participants,
                'title' => $title,
                'type' => $type,
                'campaign_id' => $campaignId
            ]);

            return response()->json([
                'success' => true,
                'data' => $conversation,
                'message' => 'Conversa criada com sucesso'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar conversa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter detalhes de uma conversa
     */
    public function show(Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar se o usuário é participante da conversa
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta conversa'
            ], 403);
        }

        $conversation->load(['participants.user', 'campaign', 'messages.sender']);

        return response()->json([
            'success' => true,
            'data' => $conversation,
            'message' => 'Conversa recuperada com sucesso'
        ]);
    }

    /**
     * Adicionar participante à conversa
     */
    public function addParticipant(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $user = Auth::user();
        $userId = $request->get('user_id');

        // Verificar se o usuário tem permissão para adicionar participantes
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        if (!$participant || !in_array($participant->role, ['admin', 'owner'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sem permissão para adicionar participantes'
            ], 403);
        }

        // Verificar se o usuário já é participante
        if ($conversation->participants()->where('user_id', $userId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário já é participante desta conversa'
            ], 409);
        }

        try {
            $this->chatService->addParticipant($conversation->id, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Participante adicionado com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao adicionar participante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover participante da conversa
     */
    public function removeParticipant(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $user = Auth::user();
        $userId = $request->get('user_id');

        // Verificar permissões
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        if (!$participant || !in_array($participant->role, ['admin', 'owner'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sem permissão para remover participantes'
            ], 403);
        }

        try {
            $this->chatService->removeParticipant($conversation->id, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Participante removido com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover participante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sair da conversa
     */
    public function leave(Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        try {
            $this->chatService->removeParticipant($conversation->id, $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Você saiu da conversa'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao sair da conversa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter conversas de uma campanha
     */
    public function getCampaignConversations($campaignId): JsonResponse
    {
        $user = Auth::user();

        try {
            // Verificar se o usuário é membro da campanha
            $campaign = \App\Models\Campaign::findOrFail($campaignId);
            if (!$campaign->members()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Você não é membro desta campanha'
                ], 403);
            }

            // Buscar conversas da campanha
            $conversations = Conversation::where('campaign_id', $campaignId)
                ->whereHas('participants', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['participants.user', 'messages' => function($query) {
                    $query->latest()->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $conversations,
                'message' => 'Conversas da campanha recuperadas com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar conversas da campanha',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
