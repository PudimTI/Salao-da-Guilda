<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CampaignPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function view(User $user, Campaign $campaign)
    {
        // Pode ver se é o dono, membro, ou se a campanha é pública
        return $campaign->owner_id === $user->id ||
               $campaign->members()->where('user_id', $user->id)->exists() ||
               $campaign->visibility === 'public';
    }

    public function create(User $user)
    {
        return true; // Qualquer usuário autenticado pode criar campanhas
    }

    public function update(User $user, Campaign $campaign)
    {
        // Apenas o dono pode atualizar
        return $campaign->owner_id === $user->id;
    }

    public function delete(User $user, Campaign $campaign)
    {
        // Apenas o dono pode deletar
        return $campaign->owner_id === $user->id;
    }

    public function invite(User $user, Campaign $campaign)
    {
        // Dono e co-masters podem convidar
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function removeMember(User $user, Campaign $campaign, User $targetUser)
    {
        // Apenas o dono pode remover membros
        if ($campaign->owner_id !== $user->id) {
            return false;
        }

        // Não pode remover a si mesmo
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Não pode remover o dono
        if ($campaign->owner_id === $targetUser->id) {
            return false;
        }

        return true;
    }

    public function leave(User $user, Campaign $campaign)
    {
        // Pode sair se for membro, mas não se for o dono
        return $campaign->members()->where('user_id', $user->id)->exists() &&
               $campaign->owner_id !== $user->id;
    }

    public function updateMemberRole(User $user, Campaign $campaign, User $targetUser)
    {
        // Apenas o dono pode atualizar roles
        if ($campaign->owner_id !== $user->id) {
            return false;
        }

        // Não pode alterar o próprio role
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Não pode alterar o role do dono
        if ($campaign->owner_id === $targetUser->id) {
            return false;
        }

        return true;
    }

    public function uploadFiles(User $user, Campaign $campaign)
    {
        // Dono e membros ativos podem fazer upload
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        return $membership !== null;
    }

    public function manageMindmap(User $user, Campaign $campaign)
    {
        // Dono e masters podem gerenciar mapa mental
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function rollDice(User $user, Campaign $campaign)
    {
        // Dono e membros ativos podem rolar dados
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        return $membership !== null;
    }

    // Métodos específicos para mindmap
    public function viewMindmap(User $user, Campaign $campaign)
    {
        // Dono e membros podem visualizar mapa mental
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        return $campaign->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function createMindmapNode(User $user, Campaign $campaign)
    {
        // Dono e masters podem criar nós
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function updateMindmapNode(User $user, Campaign $campaign)
    {
        // Dono e masters podem atualizar nós
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function deleteMindmapNode(User $user, Campaign $campaign)
    {
        // Apenas o dono pode deletar nós
        return $campaign->owner_id === $user->id;
    }

    public function createMindmapEdge(User $user, Campaign $campaign)
    {
        // Dono e masters podem criar conexões
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function updateMindmapEdge(User $user, Campaign $campaign)
    {
        // Dono e masters podem atualizar conexões
        if ($campaign->owner_id === $user->id) {
            return true;
        }

        $membership = $campaign->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['master', 'co_master'])
            ->first();

        return $membership !== null;
    }

    public function deleteMindmapEdge(User $user, Campaign $campaign)
    {
        // Apenas o dono pode deletar conexões
        return $campaign->owner_id === $user->id;
    }
}
