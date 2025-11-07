<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
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
     * Determine whether the user can view any posts.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the post.
     */
    public function view(User $user, Post $post): bool
    {
        // Usuário pode ver seus próprios posts
        if ($post->author_id === $user->id) {
            return true;
        }

        // Posts públicos podem ser vistos por todos
        if ($post->visibility === 'public') {
            return true;
        }

        // Posts privados só podem ser vistos pelo autor
        if ($post->visibility === 'private') {
            return false;
        }

        // Posts para amigos (implementar lógica de amizade se necessário)
        if ($post->visibility === 'friends') {
            // Por enquanto, apenas o autor pode ver
            return $post->author_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create posts.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the post.
     */
    public function update(User $user, Post $post): bool
    {
        return $post->author_id === $user->id;
    }

    /**
     * Determine whether the user can delete the post.
     */
    public function delete(User $user, Post $post): bool
    {
        return $post->author_id === $user->id;
    }

    /**
     * Determine whether the user can restore the post.
     */
    public function restore(User $user, Post $post): bool
    {
        return $post->author_id === $user->id;
    }

    /**
     * Determine whether the user can permanently delete the post.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        return $post->author_id === $user->id;
    }

    /**
     * Determine whether the user can like the post.
     */
    public function like(User $user, Post $post): bool
    {
        // Usuário pode curtir posts que pode visualizar
        return $this->view($user, $post);
    }

    /**
     * Determine whether the user can repost the post.
     */
    public function repost(User $user, Post $post): bool
    {
        // Usuário pode repostar posts que pode visualizar
        return $this->view($user, $post);
    }

    /**
     * Determine whether the user can comment on the post.
     */
    public function comment(User $user, Post $post): bool
    {
        // Usuário pode comentar em posts que pode visualizar
        return $this->view($user, $post);
    }
}
