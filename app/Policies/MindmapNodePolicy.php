<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MindmapNode;
use App\Models\Campaign;

class MindmapNodePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MindmapNode $mindmapNode): bool
    {
        // Verificar se o usuário é membro da campanha
        return $mindmapNode->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Campaign $campaign): bool
    {
        // Apenas membros da campanha podem criar nós
        return $campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MindmapNode $mindmapNode): bool
    {
        // Apenas membros da campanha podem atualizar nós
        return $mindmapNode->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MindmapNode $mindmapNode): bool
    {
        // Apenas membros da campanha podem deletar nós
        return $mindmapNode->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }
}
