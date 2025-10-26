<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TagPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any tags.
     */
    public function viewAny(User $user): bool
    {
        return true; // Todos podem ver tags
    }

    /**
     * Determine whether the user can view the tag.
     */
    public function view(User $user, Tag $tag): bool
    {
        return true; // Todos podem ver uma tag específica
    }

    /**
     * Determine whether the user can create tags.
     */
    public function create(User $user): bool
    {
        return true; // Todos podem criar tags
    }

    /**
     * Determine whether the user can update the tag.
     */
    public function update(User $user, Tag $tag): bool
    {
        // Administradores podem editar qualquer tag
        if ($user->hasRole('admin')) {
            return true;
        }

        // Usuários podem editar tags que criaram (se houver campo created_by)
        // Por enquanto, apenas admins podem editar
        return false;
    }

    /**
     * Determine whether the user can delete the tag.
     */
    public function delete(User $user, Tag $tag): bool
    {
        // Apenas administradores podem deletar tags
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the tag.
     */
    public function restore(User $user, Tag $tag): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the tag.
     */
    public function forceDelete(User $user, Tag $tag): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can moderate the tag.
     */
    public function moderate(User $user, Tag $tag): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can merge tags.
     */
    public function merge(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can bulk import tags.
     */
    public function bulkImport(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can manage tag synonyms.
     */
    public function manageSynonyms(User $user, Tag $tag): bool
    {
        // Administradores podem gerenciar sinônimos
        if ($user->hasRole('admin')) {
            return true;
        }

        // Usuários podem gerenciar sinônimos de tags que criaram
        // Por enquanto, apenas admins podem gerenciar sinônimos
        return false;
    }
}
