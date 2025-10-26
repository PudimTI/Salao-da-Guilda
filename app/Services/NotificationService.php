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
use Illuminate\Support\Facades\Notification as NotificationFacade;

class NotificationService
{
    /**
     * Enviar notificação de solicitação de amizade recebida
     */
    public function sendFriendRequestNotification(FriendRequest $friendRequest): void
    {
        $fromUser = $friendRequest->fromUser;
        $toUser = $friendRequest->toUser;

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
        $toUser->notify(new FriendRequestReceived($friendRequest));
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

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
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
}
