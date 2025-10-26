<?php

namespace App\Policies;

use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FriendshipPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any friendships.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the friendship.
     */
    public function view(User $user, Friendship $friendship): bool
    {
        return $user->id === $friendship->user_id || $user->id === $friendship->friend_id;
    }

    /**
     * Determine whether the user can create friendships.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the friendship.
     */
    public function update(User $user, Friendship $friendship): bool
    {
        return $user->id === $friendship->user_id;
    }

    /**
     * Determine whether the user can delete the friendship.
     */
    public function delete(User $user, Friendship $friendship): bool
    {
        return $user->id === $friendship->user_id || $user->id === $friendship->friend_id;
    }

    /**
     * Determine whether the user can send friend requests.
     */
    public function sendRequest(User $user, User $targetUser): bool
    {
        // Não pode enviar para si mesmo
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Verificar se já são amigos
        $existingFriendship = Friendship::where(function($query) use ($user, $targetUser) {
            $query->where('user_id', $user->id)->where('friend_id', $targetUser->id);
        })->orWhere(function($query) use ($user, $targetUser) {
            $query->where('user_id', $targetUser->id)->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            return false;
        }

        // Verificar se já existe solicitação pendente
        $existingRequest = FriendRequest::where('from_user_id', $user->id)
            ->where('to_user_id', $targetUser->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return false;
        }

        // Verificar se o usuário está bloqueado
        $isBlocked = Friendship::where('user_id', $targetUser->id)
            ->where('friend_id', $user->id)
            ->where('state', 'blocked')
            ->exists();

        if ($isBlocked) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can respond to friend requests.
     */
    public function respondRequest(User $user, FriendRequest $friendRequest): bool
    {
        return $user->id === $friendRequest->to_user_id;
    }

    /**
     * Determine whether the user can cancel friend requests.
     */
    public function cancelRequest(User $user, FriendRequest $friendRequest): bool
    {
        return $user->id === $friendRequest->from_user_id;
    }

    /**
     * Determine whether the user can block other users.
     */
    public function blockUser(User $user, User $targetUser): bool
    {
        return $user->id !== $targetUser->id;
    }

    /**
     * Determine whether the user can unblock other users.
     */
    public function unblockUser(User $user, User $targetUser): bool
    {
        return $user->id !== $targetUser->id;
    }

    /**
     * Determine whether the user can view friend requests.
     */
    public function viewRequests(User $user, FriendRequest $friendRequest): bool
    {
        return $user->id === $friendRequest->from_user_id || $user->id === $friendRequest->to_user_id;
    }

    /**
     * Determine whether the user can view their own friendships.
     */
    public function viewOwnFriendships(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view friendship statistics.
     */
    public function viewStats(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can search for potential friends.
     */
    public function searchPotentialFriends(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view mutual friends.
     */
    public function viewMutualFriends(User $user, User $targetUser): bool
    {
        // Pode ver amigos em comum se não estiver bloqueado
        $isBlocked = Friendship::where('user_id', $targetUser->id)
            ->where('friend_id', $user->id)
            ->where('state', 'blocked')
            ->exists();

        return !$isBlocked;
    }

    /**
     * Determine whether the user can view friendship history.
     */
    public function viewHistory(User $user): bool
    {
        return true;
    }
}
