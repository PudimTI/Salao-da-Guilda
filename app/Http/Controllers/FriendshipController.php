<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendFriendRequestRequest;
use App\Http\Requests\RespondFriendRequestRequest;
use App\Http\Requests\RemoveFriendshipRequest;
use App\Http\Requests\BlockUserRequest;
use App\Http\Requests\UnblockUserRequest;
use App\Models\Friendship;
use App\Models\FriendRequest;
use App\Models\User;
use App\Services\FriendshipService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendshipController extends Controller
{
    protected FriendshipService $friendshipService;
    protected NotificationService $notificationService;

    public function __construct(FriendshipService $friendshipService, NotificationService $notificationService)
    {
        $this->friendshipService = $friendshipService;
        $this->notificationService = $notificationService;
    }

    /**
     * Listar amigos do usuário autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status', 'active');

        $friends = $this->friendshipService->getUserFriends($user->id, [
            'per_page' => $perPage,
            'search' => $search,
            'status' => $status
        ]);

        return response()->json([
            'success' => true,
            'data' => $friends,
            'message' => 'Lista de amigos recuperada com sucesso'
        ]);
    }

    /**
     * Enviar solicitação de amizade
     */
    public function sendRequest(SendFriendRequestRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $targetUserId = $request->validated()['user_id'];
            $message = $request->validated()['message'] ?? null;

            // Verificar se já existe solicitação ou amizade
            $existingRequest = FriendRequest::where('from_user_id', $user->id)
                ->where('to_user_id', $targetUserId)
                ->where('status', 'pending')
                ->first();

            if ($existingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Já existe uma solicitação de amizade pendente para este usuário'
                ], 409);
            }

            $existingFriendship = Friendship::where(function($query) use ($user, $targetUserId) {
                $query->where('user_id', $user->id)->where('friend_id', $targetUserId);
            })->orWhere(function($query) use ($user, $targetUserId) {
                $query->where('user_id', $targetUserId)->where('friend_id', $user->id);
            })->first();

            if ($existingFriendship) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vocês já são amigos'
                ], 409);
            }

            // Criar solicitação
            $friendRequest = FriendRequest::create([
                'from_user_id' => $user->id,
                'to_user_id' => $targetUserId,
                'message' => $message,
                'status' => 'pending',
                'created_at' => now()
            ]);

            // Verificar se a solicitação foi criada corretamente
            if (!$friendRequest || !$friendRequest->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao criar solicitação de amizade'
                ], 500);
            }

            // Recarregar a solicitação para garantir que está persistida
            $friendRequest->refresh();

            // Enviar notificação apenas se a solicitação foi criada com sucesso
            try {
                $this->notificationService->sendFriendRequestNotification($friendRequest);
            } catch (\Exception $e) {
                // Log do erro mas não falha a criação da solicitação
                \Illuminate\Support\Facades\Log::error('Erro ao enviar notificação de solicitação de amizade: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => $friendRequest->load(['fromUser', 'toUser']),
                'message' => 'Solicitação de amizade enviada com sucesso'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar solicitação de amizade: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Responder solicitação de amizade
     */
    public function respondRequest(RespondFriendRequestRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $requestId = $request->validated()['request_id'];
            $action = $request->validated()['action']; // 'accept' ou 'reject'

            $friendRequest = FriendRequest::where('id', $requestId)
                ->where('to_user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solicitação de amizade não encontrada'
                ], 404);
            }

            DB::beginTransaction();

            try {
                if ($action === 'accept') {
                    // Criar amizade bidirecional
                    Friendship::create([
                        'user_id' => $friendRequest->from_user_id,
                        'friend_id' => $friendRequest->to_user_id,
                        'since' => now(),
                        'state' => 'active'
                    ]);

                    Friendship::create([
                        'user_id' => $friendRequest->to_user_id,
                        'friend_id' => $friendRequest->from_user_id,
                        'since' => now(),
                        'state' => 'active'
                    ]);

                    // Enviar notificação de aceite
                    $this->notificationService->sendFriendRequestAcceptedNotification($friendRequest);
                }

                // Atualizar status da solicitação
                $friendRequest->update([
                    'status' => $action === 'accept' ? 'accepted' : 'rejected',
                    'responded_at' => now()
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => $friendRequest->fresh(['fromUser', 'toUser']),
                    'message' => $action === 'accept' 
                        ? 'Solicitação de amizade aceita com sucesso' 
                        : 'Solicitação de amizade rejeitada'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao responder solicitação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover amizade
     */
    public function removeFriendship(RemoveFriendshipRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $friendId = $request->validated()['friend_id'];

            DB::beginTransaction();

            try {
                // Remover amizade bidirecional
                Friendship::where('user_id', $user->id)
                    ->where('friend_id', $friendId)
                    ->delete();

                Friendship::where('user_id', $friendId)
                    ->where('friend_id', $user->id)
                    ->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Amizade removida com sucesso'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover amizade: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bloquear usuário
     */
    public function blockUser(BlockUserRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $targetUserId = $request->validated()['user_id'];

            DB::beginTransaction();

            try {
                // Remover amizade se existir
                Friendship::where('user_id', $user->id)
                    ->where('friend_id', $targetUserId)
                    ->delete();

                Friendship::where('user_id', $targetUserId)
                    ->where('friend_id', $user->id)
                    ->delete();

                // Criar bloqueio
                Friendship::create([
                    'user_id' => $user->id,
                    'friend_id' => $targetUserId,
                    'since' => now(),
                    'state' => 'blocked'
                ]);

                // Cancelar solicitações pendentes
                FriendRequest::where('from_user_id', $user->id)
                    ->where('to_user_id', $targetUserId)
                    ->where('status', 'pending')
                    ->update(['status' => 'cancelled']);

                FriendRequest::where('from_user_id', $targetUserId)
                    ->where('to_user_id', $user->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'cancelled']);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Usuário bloqueado com sucesso'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao bloquear usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desbloquear usuário
     */
    public function unblockUser(UnblockUserRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $targetUserId = $request->validated()['user_id'];

            // Remover bloqueio
            Friendship::where('user_id', $user->id)
                ->where('friend_id', $targetUserId)
                ->where('state', 'blocked')
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuário desbloqueado com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao desbloquear usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar solicitações de amizade recebidas
     */
    public function getReceivedRequests(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);

        $requests = FriendRequest::where('to_user_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('fromUser') // Garantir que o fromUser existe
            ->with(['fromUser'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $requests,
            'message' => 'Solicitações recebidas recuperadas com sucesso'
        ]);
    }

    /**
     * Listar solicitações de amizade enviadas
     */
    public function getSentRequests(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);

        $requests = FriendRequest::where('from_user_id', $user->id)
            ->with(['toUser'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $requests,
            'message' => 'Solicitações enviadas recuperadas com sucesso'
        ]);
    }

    /**
     * Cancelar solicitação de amizade enviada
     */
    public function cancelRequest(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $requestId = $request->get('request_id');

            $friendRequest = FriendRequest::where('id', $requestId)
                ->where('from_user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solicitação não encontrada ou já processada'
                ], 404);
            }

            $friendRequest->update([
                'status' => 'cancelled',
                'responded_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Solicitação cancelada com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar solicitação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar status de relacionamento entre usuários
     */
    public function getRelationshipStatus(Request $request): JsonResponse
    {
        $user = Auth::user();
        $targetUserId = $request->get('user_id');

        $relationship = $this->friendshipService->getRelationshipStatus($user->id, $targetUserId);

        return response()->json([
            'success' => true,
            'data' => $relationship,
            'message' => 'Status do relacionamento recuperado com sucesso'
        ]);
    }

    /**
     * Listar usuários bloqueados
     */
    public function getBlockedUsers(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 15);

            $blockedUsers = Friendship::where('user_id', $user->id)
                ->where('state', 'blocked')
                ->with(['friend' => function ($query) {
                    $query->select('id', 'handle', 'display_name', 'avatar_url', 'bio', 'status');
                }])
                ->orderBy('since', 'desc')
                ->paginate($perPage);

            $data = $blockedUsers->map(function ($friendship) {
                return [
                    'id' => $friendship->friend->id,
                    'handle' => $friendship->friend->handle,
                    'display_name' => $friendship->friend->display_name,
                    'avatar_url' => $friendship->friend->avatar_url,
                    'bio' => $friendship->friend->bio,
                    'status' => $friendship->friend->status,
                    'blocked_since' => $friendship->since,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => $blockedUsers->currentPage(),
                    'last_page' => $blockedUsers->lastPage(),
                    'per_page' => $blockedUsers->perPage(),
                    'total' => $blockedUsers->total(),
                ],
                'message' => 'Usuários bloqueados recuperados com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao recuperar usuários bloqueados: ' . $e->getMessage()
            ], 500);
        }
    }
}
