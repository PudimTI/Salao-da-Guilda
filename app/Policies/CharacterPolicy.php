<?php

namespace App\Policies;

use App\Models\Character;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CharacterPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Character $character)
    {
        // Usuário pode ver seus próprios personagens
        if ($user->id === $character->user_id) {
            return true;
        }

        // Usuário pode ver personagens de campanhas que participa
        return $character->campaigns()->whereHas('members', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Character $character)
    {
        return $user->id === $character->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Character $character)
    {
        return $user->id === $character->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Character $character)
    {
        return $user->id === $character->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Character $character)
    {
        return $user->id === $character->user_id;
    }
}
