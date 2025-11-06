<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\CampaignInvite;
use App\Models\User;
use App\Models\Character;
use App\Http\Requests\InviteToCampaignRequest;
use App\Http\Requests\CharacterInviteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CampaignInviteController extends Controller
{
    use AuthorizesRequests;

    /**
     * Lista convites pendentes do usuário
     */
    public function index()
    {
        $invites = CampaignInvite::with(['campaign.owner', 'inviter'])
            ->where('invitee_id', Auth::id())
            ->where('status', 'pending')
            ->orderBy('sent_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invites->map(function ($invite) {
                return [
                    'id' => $invite->id,
                    'campaign' => [
                        'id' => $invite->campaign->id,
                        'name' => $invite->campaign->name,
                        'description' => $invite->campaign->description,
                        'system' => $invite->campaign->system,
                        'type' => $invite->campaign->type,
                        'city' => $invite->campaign->city,
                        'owner' => [
                            'id' => $invite->campaign->owner->id,
                            'name' => $invite->campaign->owner->name,
                            'display_name' => $invite->campaign->owner->display_name,
                        ]
                    ],
                    'inviter' => [
                        'id' => $invite->inviter->id,
                        'name' => $invite->inviter->name,
                        'display_name' => $invite->inviter->display_name,
                    ],
                    'message' => $invite->message,
                    'sent_at' => $invite->sent_at,
                ];
            }),
            'message' => 'Convites pendentes carregados com sucesso'
        ]);
    }

    /**
     * Envia convite para usuário por email
     */
    public function inviteUser(InviteToCampaignRequest $request, Campaign $campaign)
    {
        $this->authorize('invite', $campaign);
        
        $validated = $request->validated();
        
        $invitee = User::where('email', $validated['email'])->first();
        
        if (!$invitee) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado com este email.'
            ], 404);
        }

        // Verificar se já é membro
        if ($campaign->members()->where('user_id', $invitee->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Este usuário já é membro da campanha.'
            ], 400);
        }

        // Verificar se já existe convite pendente
        if ($campaign->invites()->where('invitee_id', $invitee->id)->where('status', 'pending')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Já existe um convite pendente para este usuário.'
            ], 400);
        }

        $invite = CampaignInvite::create([
            'campaign_id' => $campaign->id,
            'inviter_id' => Auth::id(),
            'invitee_id' => $invitee->id,
            'message' => $validated['message'],
            'sent_at' => now(),
        ]);

        // TODO: Enviar notificação/email para o usuário

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $invite->id,
                'invitee' => [
                    'id' => $invitee->id,
                    'name' => $invitee->name,
                    'email' => $invitee->email,
                ],
                'message' => $invite->message,
                'sent_at' => $invite->sent_at,
            ],
            'message' => 'Convite enviado com sucesso!'
        ]);
    }

    /**
     * Solicita entrada na campanha com personagem
     */
    public function requestWithCharacter(CharacterInviteRequest $request, Campaign $campaign)
    {
        $validated = $request->validated();
        $character = Character::findOrFail($validated['character_id']);
        
        // Verificar se o personagem pertence ao usuário
        if ($character->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Este personagem não pertence a você.'
            ], 403);
        }

        // Verificar se o personagem já está na campanha
        if ($campaign->characters()->where('character_id', $character->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Este personagem já está nesta campanha.'
            ], 400);
        }

        // Verificar se o usuário já é membro da campanha
        if ($campaign->members()->where('user_id', Auth::id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Você já é membro desta campanha.'
            ], 400);
        }

        // Verificar se já existe solicitação pendente do usuário para esta campanha
        if ($campaign->invites()->where('inviter_id', Auth::id())->where('status', 'pending')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Você já tem uma solicitação pendente para esta campanha.'
            ], 400);
        }

        // Criar solicitação de entrada para o dono da campanha
        $invite = CampaignInvite::create([
            'campaign_id' => $campaign->id,
            'inviter_id' => Auth::id(), // Quem está solicitando
            'invitee_id' => $campaign->owner_id, // Dono da campanha
            'message' => $validated['message'] ?? "Solicitação de entrada com personagem: {$character->name}",
            'sent_at' => now(),
        ]);

        // TODO: Notificar o dono da campanha sobre a solicitação

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $invite->id,
                'character' => [
                    'id' => $character->id,
                    'name' => $character->name,
                    'class' => $character->class,
                    'level' => $character->level,
                ],
                'message' => $invite->message,
                'sent_at' => $invite->sent_at,
            ],
            'message' => 'Solicitação de entrada enviada com sucesso!'
        ]);
    }

    /**
     * Aceita convite
     */
    public function accept(Request $request, CampaignInvite $invite)
    {
        // Verificar se o convite pertence ao usuário
        if ($invite->invitee_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Este convite não é para você.'
            ], 403);
        }

        // Verificar se o convite está pendente
        if ($invite->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Este convite já foi processado.'
            ], 400);
        }

        // Verificar se o usuário que está aceitando já é membro
        if ($invite->campaign->members()->where('user_id', $invite->invitee_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Você já é membro desta campanha.'
            ], 400);
        }

        // Atualizar status do convite
        $invite->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        // Adicionar usuário que aceitou o convite à campanha (invitee_id)
        $invite->campaign->members()->attach($invite->invitee_id, [
            'role' => 'player',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => [
                    'id' => $invite->campaign->id,
                    'name' => $invite->campaign->name,
                ],
                'user' => [
                    'id' => $invite->invitee->id,
                    'name' => $invite->invitee->name,
                    'display_name' => $invite->invitee->display_name,
                ],
                'role' => 'player',
                'joined_at' => now(),
            ],
            'message' => 'Convite aceito com sucesso!'
        ]);
    }

    /**
     * Rejeita convite
     */
    public function reject(Request $request, CampaignInvite $invite)
    {
        // Verificar se o convite pertence ao usuário
        if ($invite->invitee_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Este convite não é para você.'
            ], 403);
        }

        // Verificar se o convite está pendente
        if ($invite->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Este convite já foi processado.'
            ], 400);
        }

        // Atualizar status do convite
        $invite->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Convite rejeitado com sucesso.'
        ]);
    }

    /**
     * Lista convites enviados pela campanha
     */
    public function sentInvites(Campaign $campaign)
    {
        $this->authorize('view', $campaign);
        
        $invites = $campaign->invites()
            ->with(['invitee', 'inviter'])
            ->orderBy('sent_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invites->map(function ($invite) use ($campaign) {
                // Determinar se é uma solicitação de entrada (invitee_id é o dono da campanha)
                $isRequest = $invite->invitee_id === $campaign->owner_id;
                
                return [
                    'id' => $invite->id,
                    'invitee' => [
                        'id' => $invite->invitee->id,
                        'name' => $invite->invitee->name,
                        'display_name' => $invite->invitee->display_name,
                        'email' => $invite->invitee->email,
                    ],
                    'inviter' => [
                        'id' => $invite->inviter->id,
                        'name' => $invite->inviter->name,
                        'display_name' => $invite->inviter->display_name,
                    ],
                    'status' => $invite->status,
                    'message' => $invite->message,
                    'sent_at' => $invite->sent_at,
                    'responded_at' => $invite->responded_at,
                    'is_request' => $isRequest,
                    'is_self_invite' => $invite->inviter_id === $invite->invitee_id,
                    'campaign_owner_id' => $campaign->owner_id,
                ];
            }),
            'message' => 'Convites enviados carregados com sucesso'
        ]);
    }

    /**
     * Cancela convite (apenas quem enviou pode cancelar)
     */
    public function cancel(Request $request, CampaignInvite $invite)
    {
        // Verificar se o usuário pode cancelar (quem enviou ou dono da campanha)
        $canCancel = $invite->inviter_id === Auth::id() || 
                     $invite->campaign->owner_id === Auth::id();

        if (!$canCancel) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para cancelar este convite.'
            ], 403);
        }

        // Verificar se o convite está pendente
        if ($invite->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Apenas convites pendentes podem ser cancelados.'
            ], 400);
        }

        // Atualizar status do convite
        $invite->update([
            'status' => 'cancelled',
            'responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Convite cancelado com sucesso.'
        ]);
    }

    /**
     * Aprova solicitação de entrada (apenas dono/co-masters)
     */
    public function approveRequest(Request $request, Campaign $campaign, $inviteId)
    {
        // Buscar o convite
        $invite = CampaignInvite::where('id', $inviteId)
            ->where('campaign_id', $campaign->id)
            ->with(['campaign', 'inviter'])
            ->firstOrFail();
        
        $this->authorize('invite', $campaign);
        
        // Verificar se é uma solicitação (inviter_id diferente de invitee_id)
        if ($invite->inviter_id === $invite->invitee_id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações podem ser aprovadas.'
            ], 400);
        }

        // Verificar se o convite está pendente
        if ($invite->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta solicitação já foi processada.'
            ], 400);
        }

        // Verificar se o usuário que solicitou já é membro (inviter_id é quem solicitou entrada)
        if ($campaign->members()->where('user_id', $invite->inviter_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Este usuário já é membro da campanha.'
            ], 400);
        }

        // Atualizar status do convite
        $invite->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        // Adicionar usuário à campanha (quem fez a solicitação)
        $campaign->members()->attach($invite->inviter_id, [
            'role' => 'player',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $invite->inviter->id,
                    'name' => $invite->inviter->name,
                ],
                'role' => 'player',
                'joined_at' => now(),
            ],
            'message' => 'Solicitação aprovada com sucesso!'
        ]);
    }

    /**
     * Rejeita solicitação de entrada
     */
    public function rejectRequest(Request $request, Campaign $campaign, $inviteId)
    {
        // Buscar o convite
        $invite = CampaignInvite::where('id', $inviteId)
            ->where('campaign_id', $campaign->id)
            ->with(['campaign', 'inviter'])
            ->firstOrFail();
        
        $this->authorize('invite', $campaign);
        
        // Verificar se é uma solicitação (inviter_id diferente de invitee_id)
        if ($invite->inviter_id === $invite->invitee_id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações podem ser rejeitadas.'
            ], 400);
        }

        // Verificar se o convite está pendente
        if ($invite->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta solicitação já foi processada.'
            ], 400);
        }

        // Atualizar status do convite
        $invite->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação rejeitada com sucesso.'
        ]);
    }
}
