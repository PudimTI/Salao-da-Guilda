<?php

namespace App\Services;

use App\Models\Friendship;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class FriendshipService
{
    /**
     * Obter lista de amigos do usuário
     */
    public function getUserFriends(int $userId, array $options = []): LengthAwarePaginator
    {
        $perPage = $options['per_page'] ?? 15;
        $search = $options['search'] ?? null;
        $status = $options['status'] ?? 'active';

        $query = Friendship::where('user_id', $userId)
            ->where('state', $status)
            ->with(['friend' => function($query) {
                $query->select('id', 'handle', 'display_name', 'avatar_url', 'status', 'email');
            }]);

        if ($search) {
            $query->whereHas('friend', function($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                  ->orWhere('handle', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('since', 'desc')
            ->paginate($perPage);
    }

    /**
     * Obter status do relacionamento entre dois usuários
     */
    public function getRelationshipStatus(int $userId, int $targetUserId): array
    {
        // Verificar se são amigos
        $friendship = Friendship::where('user_id', $userId)
            ->where('friend_id', $targetUserId)
            ->first();

        if ($friendship) {
            return [
                'status' => $friendship->state,
                'since' => $friendship->since,
                'type' => 'friendship'
            ];
        }

        // Verificar se há solicitação pendente
        $sentRequest = FriendRequest::where('from_user_id', $userId)
            ->where('to_user_id', $targetUserId)
            ->where('status', 'pending')
            ->first();

        if ($sentRequest) {
            return [
                'status' => 'request_sent',
                'request_id' => $sentRequest->id,
                'created_at' => $sentRequest->created_at,
                'type' => 'friend_request'
            ];
        }

        $receivedRequest = FriendRequest::where('from_user_id', $targetUserId)
            ->where('to_user_id', $userId)
            ->where('status', 'pending')
            ->first();

        if ($receivedRequest) {
            return [
                'status' => 'request_received',
                'request_id' => $receivedRequest->id,
                'created_at' => $receivedRequest->created_at,
                'type' => 'friend_request'
            ];
        }

        // Verificar se foi bloqueado
        $blocked = Friendship::where('user_id', $targetUserId)
            ->where('friend_id', $userId)
            ->where('state', 'blocked')
            ->first();

        if ($blocked) {
            return [
                'status' => 'blocked_by_user',
                'type' => 'block'
            ];
        }

        return [
            'status' => 'no_relationship',
            'type' => 'none'
        ];
    }

    /**
     * Verificar se dois usuários são amigos
     */
    public function areFriends(int $userId, int $friendId): bool
    {
        return Friendship::where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('state', 'active')
            ->exists();
    }

    /**
     * Verificar se um usuário está bloqueado por outro
     */
    public function isBlocked(int $userId, int $blockerId): bool
    {
        return Friendship::where('user_id', $blockerId)
            ->where('friend_id', $userId)
            ->where('state', 'blocked')
            ->exists();
    }

    /**
     * Obter estatísticas de amizade do usuário
     */
    public function getFriendshipStats(int $userId): array
    {
        $stats = [
            'total_friends' => Friendship::where('user_id', $userId)
                ->where('state', 'active')
                ->count(),
            'pending_requests_sent' => FriendRequest::where('from_user_id', $userId)
                ->where('status', 'pending')
                ->count(),
            'pending_requests_received' => FriendRequest::where('to_user_id', $userId)
                ->where('status', 'pending')
                ->count(),
            'blocked_users' => Friendship::where('user_id', $userId)
                ->where('state', 'blocked')
                ->count()
        ];

        return $stats;
    }

    /**
     * Buscar usuários que podem ser amigos (não são amigos, não há solicitação pendente)
     */
    public function getPotentialFriends(int $userId, array $options = []): LengthAwarePaginator
    {
        $perPage = $options['per_page'] ?? 15;
        $search = $options['search'] ?? null;
        $excludeIds = $options['exclude_ids'] ?? [];

        // IDs de usuários que já são amigos
        $friendIds = Friendship::where('user_id', $userId)
            ->pluck('friend_id')
            ->toArray();

        // IDs de usuários com solicitações pendentes
        $requestIds = FriendRequest::where('from_user_id', $userId)
            ->orWhere('to_user_id', $userId)
            ->where('status', 'pending')
            ->get()
            ->pluck('from_user_id', 'to_user_id')
            ->flatten()
            ->unique()
            ->toArray();

        // IDs de usuários bloqueados
        $blockedIds = Friendship::where('user_id', $userId)
            ->where('state', 'blocked')
            ->pluck('friend_id')
            ->toArray();

        $excludeIds = array_merge($excludeIds, $friendIds, $requestIds, $blockedIds, [$userId]);

        $query = User::whereNotIn('id', $excludeIds)
            ->select('id', 'handle', 'display_name', 'avatar_url', 'bio', 'status');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                  ->orWhere('handle', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('display_name')
            ->paginate($perPage);
    }

    /**
     * Obter amigos em comum entre dois usuários
     */
    public function getMutualFriends(int $userId, int $targetUserId): array
    {
        $userFriends = Friendship::where('user_id', $userId)
            ->where('state', 'active')
            ->pluck('friend_id')
            ->toArray();

        $targetFriends = Friendship::where('user_id', $targetUserId)
            ->where('state', 'active')
            ->pluck('friend_id')
            ->toArray();

        $mutualIds = array_intersect($userFriends, $targetFriends);

        return User::whereIn('id', $mutualIds)
            ->select('id', 'handle', 'display_name', 'avatar_url')
            ->get()
            ->toArray();
    }

    /**
     * Obter histórico de solicitações de amizade
     */
    public function getFriendshipHistory(int $userId, array $options = []): LengthAwarePaginator
    {
        $perPage = $options['per_page'] ?? 15;
        $type = $options['type'] ?? 'all'; // 'sent', 'received', 'all'

        $query = FriendRequest::with(['fromUser', 'toUser']);

        if ($type === 'sent') {
            $query->where('from_user_id', $userId);
        } elseif ($type === 'received') {
            $query->where('to_user_id', $userId);
        } else {
            $query->where(function($q) use ($userId) {
                $q->where('from_user_id', $userId)
                  ->orWhere('to_user_id', $userId);
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Limpar solicitações antigas e rejeitadas
     */
    public function cleanupOldRequests(int $daysOld = 30): int
    {
        $cutoffDate = now()->subDays($daysOld);

        return FriendRequest::where('status', 'rejected')
            ->where('responded_at', '<', $cutoffDate)
            ->delete();
    }
}
