<?php

namespace App\Services;

use App\Models\FriendRequest;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\FriendRequestReceived;
use App\Notifications\FriendRequestAccepted;
use App\Notifications\FriendRequestRejected;
use App\Notifications\FriendshipRemoved;
use App\Notifications\UserBlocked;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class NotificationService
{
    /**
     * Enviar notificação de solicitação de amizade recebida
     */
    public function sendFriendRequestNotification(FriendRequest $friendRequest): void
    {
        // Verificar se a solicitação existe e está pendente
        if (!$friendRequest || !$friendRequest->id || $friendRequest->status !== 'pending') {
            Log::warning('Tentativa de enviar notificação para solicitação inválida', [
                'request_id' => $friendRequest->id ?? null,
                'status' => $friendRequest->status ?? null
            ]);
            return;
        }

        // Recarregar relacionamentos para garantir que estão disponíveis
        $friendRequest->load(['fromUser', 'toUser']);
        
        $fromUser = $friendRequest->fromUser;
        $toUser = $friendRequest->toUser;

        // Verificar se os usuários existem
        if (!$fromUser || !$toUser) {
            Log::warning('Tentativa de enviar notificação para solicitação com usuários inválidos', [
                'request_id' => $friendRequest->id,
                'from_user_id' => $friendRequest->from_user_id,
                'to_user_id' => $friendRequest->to_user_id
            ]);
            return;
        }

        // Criar notificação no banco
        Notification::create([
            'user_id' => $toUser->id,
            'type' => 'friend_request',
            'payload' => [
                'from_user_id' => $fromUser->id,
                'from_user_name' => $fromUser->display_name,
                'from_user_handle' => $fromUser->handle,
                'from_user_avatar' => $fromUser->avatar_url,
                'message' => $friendRequest->message,
                'request_id' => $friendRequest->id
            ],
            'created_at' => now(),
            'read' => false
        ]);

        // Enviar notificação em tempo real (se configurado)
        try {
            $toUser->notify(new FriendRequestReceived($friendRequest));
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação em tempo real: ' . $e->getMessage());
            // Não falha a criação da notificação no banco
        }
    }

    /**
     * Enviar notificação de solicitação de amizade aceita
     */
    public function sendFriendRequestAcceptedNotification(FriendRequest $friendRequest): void
    {
        $fromUser = $friendRequest->fromUser;
        $toUser = $friendRequest->toUser;

        // Criar notificação no banco
        Notification::create([
            'user_id' => $fromUser->id,
            'type' => 'friend_request_accepted',
            'payload' => [
                'to_user_id' => $toUser->id,
                'to_user_name' => $toUser->display_name,
                'to_user_handle' => $toUser->handle,
                'to_user_avatar' => $toUser->avatar_url,
                'request_id' => $friendRequest->id
            ],
            'created_at' => now(),
            'read' => false
        ]);

        // Enviar notificação em tempo real
        $fromUser->notify(new FriendRequestAccepted($friendRequest));
    }

    /**
     * Enviar notificação de solicitação de amizade rejeitada
     */
    public function sendFriendRequestRejectedNotification(FriendRequest $friendRequest): void
    {
        $fromUser = $friendRequest->fromUser;
        $toUser = $friendRequest->toUser;

        // Criar notificação no banco
        Notification::create([
            'user_id' => $fromUser->id,
            'type' => 'friend_request_rejected',
            'payload' => [
                'to_user_id' => $toUser->id,
                'to_user_name' => $toUser->display_name,
                'to_user_handle' => $toUser->handle,
                'to_user_avatar' => $toUser->avatar_url,
                'request_id' => $friendRequest->id
            ],
            'created_at' => now(),
            'read' => false
        ]);

        // Enviar notificação em tempo real
        $fromUser->notify(new FriendRequestRejected($friendRequest));
    }

    /**
     * Enviar notificação de amizade removida
     */
    public function sendFriendshipRemovedNotification(User $remover, User $removed): void
    {
        // Criar notificação no banco
        Notification::create([
            'user_id' => $removed->id,
            'type' => 'friendship_removed',
            'payload' => [
                'remover_user_id' => $remover->id,
                'remover_user_name' => $remover->display_name,
                'remover_user_handle' => $remover->handle,
                'remover_user_avatar' => $remover->avatar_url
            ],
            'created_at' => now(),
            'read' => false
        ]);

        // Enviar notificação em tempo real
        $removed->notify(new FriendshipRemoved($remover));
    }

    /**
     * Enviar notificação de usuário bloqueado
     */
    public function sendUserBlockedNotification(User $blocker, User $blocked): void
    {
        // Criar notificação no banco
        Notification::create([
            'user_id' => $blocked->id,
            'type' => 'user_blocked',
            'payload' => [
                'blocker_user_id' => $blocker->id,
                'blocker_user_name' => $blocker->display_name,
                'blocker_user_handle' => $blocker->handle,
                'blocker_user_avatar' => $blocker->avatar_url
            ],
            'created_at' => now(),
            'read' => false
        ]);

        // Enviar notificação em tempo real
        $blocked->notify(new UserBlocked($blocker));
    }

    /**
     * Marcar notificações como lidas
     */
    public function markNotificationsAsRead(int $userId, array $notificationIds = []): int
    {
        $query = Notification::where('user_id', $userId)
            ->where('read', false);

        if (!empty($notificationIds)) {
            $query->whereIn('id', $notificationIds);
        }

        return $query->update(['read' => true]);
    }

    /**
     * Obter contagem de notificações não lidas
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('read', false)
            ->count();
    }

    /**
     * Obter notificações do usuário
     */
    public function getUserNotifications(int $userId, array $options = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $perPage = $options['per_page'] ?? 15;
        $type = $options['type'] ?? null;
        $unreadOnly = $options['unread_only'] ?? false;

        $query = Notification::where('user_id', $userId);

        if ($type) {
            $query->where('type', $type);
        }

        if ($unreadOnly) {
            $query->where('read', false);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Filtrar notificações órfãs de solicitações de amizade
        if ($type === 'friend_request' || !$type) {
            $notifications->getCollection()->transform(function ($notification) {
                if ($notification->type === 'friend_request') {
                    $payload = $notification->payload ?? [];
                    $requestId = $payload['request_id'] ?? null;

                    if ($requestId) {
                        $friendRequest = FriendRequest::find($requestId);
                        // Se a solicitação não existe ou não está pendente, marcar como lida
                        // para que não apareça como notificação pendente
                        if (!$friendRequest || $friendRequest->status !== 'pending' || !$friendRequest->fromUser) {
                            // Não retornar a notificação se a solicitação não existe mais
                            return null;
                        }
                    }
                }
                return $notification;
            });

            // Remover notificações null
            $notifications->setCollection(
                $notifications->getCollection()->filter(function ($notification) {
                    return $notification !== null;
                })
            );
        }

        return $notifications;
    }

    /**
     * Limpar notificações antigas
     */
    public function cleanupOldNotifications(int $daysOld = 30): int
    {
        $cutoffDate = now()->subDays($daysOld);

        return Notification::where('created_at', '<', $cutoffDate)
            ->where('read', true)
            ->delete();
    }

    /**
     * Limpar notificações órfãs de solicitações de amizade
     * Remove notificações que apontam para solicitações que não existem mais
     * ou que não estão mais pendentes
     */
    public function cleanupOrphanedFriendRequestNotifications(): int
    {
        $notifications = Notification::where('type', 'friend_request')
            ->where('read', false)
            ->get();

        $deletedCount = 0;

        foreach ($notifications as $notification) {
            $payload = $notification->payload ?? [];
            $requestId = $payload['request_id'] ?? null;

            if (!$requestId) {
                // Notificação sem request_id, pode ser antiga ou corrompida
                $notification->delete();
                $deletedCount++;
                continue;
            }

            // Verificar se a solicitação existe e está pendente
            $friendRequest = FriendRequest::find($requestId);
            
            if (!$friendRequest || $friendRequest->status !== 'pending') {
                // Solicitação não existe ou não está mais pendente
                $notification->delete();
                $deletedCount++;
                continue;
            }

            // Verificar se o fromUser ainda existe
            if (!$friendRequest->fromUser) {
                $notification->delete();
                $deletedCount++;
            }
        }

        return $deletedCount;
    }
}
