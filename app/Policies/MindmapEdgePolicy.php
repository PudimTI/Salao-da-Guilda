<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MindmapEdge;
use App\Models\Campaign;

class MindmapEdgePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MindmapEdge $mindmapEdge): bool
    {
        // Verificar se o usuário é membro da campanha
        return $mindmapEdge->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Campaign $campaign): bool
    {
        // Apenas membros da campanha podem criar conexões
        return $campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MindmapEdge $mindmapEdge): bool
    {
        // Apenas membros da campanha podem atualizar conexões
        return $mindmapEdge->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MindmapEdge $mindmapEdge): bool
    {
        // Apenas membros da campanha podem deletar conexões
        return $mindmapEdge->campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }
}
