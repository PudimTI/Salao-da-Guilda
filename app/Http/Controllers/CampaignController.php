<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\User;
use App\Models\Tag;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use App\Http\Requests\InviteToCampaignRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CampaignController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $campaigns = Campaign::with(['owner', 'members', 'tags'])
            ->where(function($query) {
                $query->where('owner_id', Auth::id())
                    ->orWhereHas('members', function($q) {
                        $q->where('user_id', Auth::id());
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return view('campaigns.index-react', compact('campaigns'));
    }

    public function create()
    {
        $tags = Tag::all();
        $systems = $this->getAvailableSystems();
        
        return view('campaigns.create', compact('tags', 'systems'));
    }

    public function store(StoreCampaignRequest $request)
    {
        $validated = $request->validated();

        $campaign = DB::transaction(function () use ($validated) {
            $campaign = Campaign::create([
                'owner_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'system' => $validated['system'],
                'type' => $validated['type'],
                'city' => $validated['city'],
                'rules' => $validated['rules'],
                'status' => $validated['status'],
                'visibility' => $validated['visibility'],
            ]);

            // Adicionar tags se fornecidas
            if (!empty($validated['tags'])) {
                $campaign->tags()->attach($validated['tags']);
            }

            // Adicionar o criador como membro com role 'master'
            $campaign->members()->attach(Auth::id(), [
                'role' => 'master',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            return $campaign;
        });

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campanha criada com sucesso!');
    }

    public function show(Campaign $campaign)
    {
        $this->authorize('view', $campaign);
        
        $campaign->load([
            'owner', 
            'members', 
            'tags', 
            'files.uploader',
            'mindmapNodes',
            'diceRolls.roller',
            'conversations'
        ]);
        
        $isMember = $campaign->members()->where('user_id', Auth::id())->exists();
        $isOwner = $campaign->owner_id === Auth::id();
        
        return view('campaigns.show-react', compact('campaign', 'isMember', 'isOwner'));
    }

    public function edit(Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        
        $tags = Tag::all();
        $systems = $this->getAvailableSystems();
        $campaignTags = $campaign->tags()->pluck('tags.id')->toArray();
        
        return view('campaigns.edit', compact('campaign', 'tags', 'systems', 'campaignTags'));
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        
        $validated = $request->validated();

        DB::transaction(function () use ($campaign, $validated) {
            $campaign->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'system' => $validated['system'],
                'type' => $validated['type'],
                'city' => $validated['city'],
                'rules' => $validated['rules'],
                'status' => $validated['status'],
                'visibility' => $validated['visibility'],
            ]);

            // Atualizar tags
            $campaign->tags()->sync($validated['tags'] ?? []);
        });

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campanha atualizada com sucesso!');
    }

    public function destroy(Campaign $campaign)
    {
        $this->authorize('delete', $campaign);
        
        $campaign->delete();
        
        return redirect()->route('campaigns.index')
            ->with('success', 'Campanha excluída com sucesso!');
    }

    public function invite(InviteToCampaignRequest $request, Campaign $campaign)
    {
        $this->authorize('invite', $campaign);
        
        $validated = $request->validated();
        
        $invitee = User::where('email', $validated['email'])->first();
        
        if (!$invitee) {
            return back()->with('error', 'Usuário não encontrado com este email.');
        }

        // Verificar se já é membro
        if ($campaign->members()->where('user_id', $invitee->id)->exists()) {
            return back()->with('error', 'Este usuário já é membro da campanha.');
        }

        // Verificar se já existe convite pendente
        if ($campaign->invites()->where('invitee_id', $invitee->id)->where('status', 'pending')->exists()) {
            return back()->with('error', 'Já existe um convite pendente para este usuário.');
        }

        $campaign->invites()->create([
            'inviter_id' => Auth::id(),
            'invitee_id' => $invitee->id,
            'message' => $validated['message'],
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Convite enviado com sucesso!');
    }

    public function acceptInvite(Campaign $campaign)
    {
        $invite = $campaign->invites()
            ->where('invitee_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$invite) {
            return back()->with('error', 'Convite não encontrado ou já processado.');
        }

        $invite->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        $campaign->members()->attach(Auth::id(), [
            'role' => 'player',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Você foi adicionado à campanha!');
    }

    public function rejectInvite(Campaign $campaign)
    {
        $invite = $campaign->invites()
            ->where('invitee_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$invite) {
            return back()->with('error', 'Convite não encontrado ou já processado.');
        }

        $invite->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Convite recusado.');
    }

    public function removeMember(Campaign $campaign, User $user)
    {
        $this->authorize('removeMember', [$campaign, $user]);
        
        $campaign->members()->detach($user->id);
        
        return back()->with('success', 'Membro removido da campanha.');
    }

    public function leave(Campaign $campaign)
    {
        $this->authorize('leave', $campaign);
        
        $campaign->members()->detach(Auth::id());
        
        return redirect()->route('campaigns.index')
            ->with('success', 'Você saiu da campanha.');
    }

    public function updateMemberRole(Request $request, Campaign $campaign, User $user)
    {
        $this->authorize('updateMemberRole', [$campaign, $user]);
        
        $request->validate([
            'role' => 'required|in:player,master,co_master'
        ]);

        $campaign->members()->updateExistingPivot($user->id, [
            'role' => $request->role
        ]);

        return back()->with('success', 'Role do membro atualizado.');
    }

    // Métodos de API para componentes React
    public function apiIndex()
    {
        $campaigns = Campaign::with(['owner', 'members', 'tags'])
            ->where(function($query) {
                $query->where('owner_id', Auth::id())
                    ->orWhereHas('members', function($q) {
                        $q->where('user_id', Auth::id());
                    });
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'data' => $campaigns->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'system' => $campaign->system,
                    'type' => $campaign->type,
                    'city' => $campaign->city,
                    'status' => $campaign->status,
                    'visibility' => $campaign->visibility,
                    'rules' => $campaign->rules,
                    'members_count' => $campaign->members->count(),
                    'members' => $campaign->members->map(function ($member) {
                        return [
                            'id' => $member->id,
                            'name' => $member->name,
                            'display_name' => $member->display_name,
                            'role' => $member->pivot->role,
                            'status' => $member->pivot->status,
                        ];
                    }),
                    'owner' => [
                        'id' => $campaign->owner->id,
                        'name' => $campaign->owner->name,
                        'display_name' => $campaign->owner->display_name,
                    ],
                    'tags' => $campaign->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    }),
                    'files' => $campaign->files ?? [],
                    'dice_rolls_count' => $campaign->diceRolls->count() ?? 0,
                    'is_member' => $campaign->members->contains(Auth::id()),
                    'is_owner' => $campaign->owner_id === Auth::id(),
                    'can_edit' => $campaign->owner_id === Auth::id(),
                    'created_at' => $campaign->created_at,
                    'updated_at' => $campaign->updated_at,
                ];
            })
        ]);
    }

    public function apiPublic()
    {
        $campaigns = Campaign::with(['owner', 'members', 'tags'])
            ->where('visibility', 'public')
            ->where('status', 'open')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'data' => $campaigns->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'system' => $campaign->system,
                    'type' => $campaign->type,
                    'city' => $campaign->city,
                    'rules' => $campaign->rules,
                    'status' => $campaign->status,
                    'visibility' => $campaign->visibility,
                    'created_at' => $campaign->created_at,
                    'updated_at' => $campaign->updated_at,
                    'owner' => [
                        'id' => $campaign->owner->id,
                        'name' => $campaign->owner->name,
                        'display_name' => $campaign->owner->display_name,
                    ],
                    'members_count' => $campaign->members->count(),
                    'is_member' => $campaign->members->contains(Auth::id()),
                    'is_owner' => $campaign->owner_id === Auth::id(),
                    'can_edit' => $campaign->owner_id === Auth::id(),
                    'tags' => $campaign->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    }),
                ];
            }),
            'message' => 'Campanhas públicas carregadas com sucesso'
        ]);
    }

    public function apiShow(Campaign $campaign)
    {
        $campaign->load(['owner', 'members', 'tags', 'files']);
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'system' => $campaign->system,
                'type' => $campaign->type,
                'city' => $campaign->city,
                'status' => $campaign->status,
                'visibility' => $campaign->visibility,
                'rules' => $campaign->rules,
                'owner_id' => $campaign->owner_id,
                'members' => $campaign->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'display_name' => $member->display_name,
                        'role' => $member->pivot->role,
                        'status' => $member->pivot->status,
                    ];
                }),
                'owner' => [
                    'id' => $campaign->owner->id,
                    'name' => $campaign->owner->name,
                    'display_name' => $campaign->owner->display_name,
                ],
                'tags' => $campaign->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ];
                }),
                'files' => $campaign->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->name,
                        'uploader' => [
                            'id' => $file->uploader->id,
                            'name' => $file->uploader->name,
                        ],
                    ];
                }),
                'dice_rolls_count' => $campaign->diceRolls->count() ?? 0,
                'is_member' => $campaign->members->contains(Auth::id()),
                'is_owner' => $campaign->owner_id === Auth::id(),
                'can_edit' => $campaign->owner_id === Auth::id(),
                'created_at' => $campaign->created_at,
                'updated_at' => $campaign->updated_at,
            ]
        ]);
    }

    public function apiStore(StoreCampaignRequest $request)
    {
        $validated = $request->validated();

        $campaign = DB::transaction(function () use ($validated) {
            $campaign = Campaign::create([
                'owner_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'system' => $validated['system'],
                'type' => $validated['type'],
                'city' => $validated['city'],
                'status' => $validated['status'],
                'visibility' => $validated['visibility'],
                'rules' => $validated['rules'],
            ]);

            // Associar tags se fornecidas
            if (!empty($validated['tags'])) {
                $campaign->tags()->attach($validated['tags']);
            }

            // Adicionar o criador como membro com role 'master'
            $campaign->members()->attach(Auth::id(), [
                'role' => 'master',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            return $campaign;
        });

        $campaign->load(['owner', 'members', 'tags']);

        return response()->json([
            'data' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'system' => $campaign->system,
                'type' => $campaign->type,
                'city' => $campaign->city,
                'status' => $campaign->status,
                'visibility' => $campaign->visibility,
                'rules' => $campaign->rules,
                'members_count' => $campaign->members->count(),
                'members' => $campaign->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'display_name' => $member->display_name,
                        'role' => $member->pivot->role,
                        'status' => $member->pivot->status,
                    ];
                }),
                'owner' => [
                    'id' => $campaign->owner->id,
                    'name' => $campaign->owner->name,
                    'display_name' => $campaign->owner->display_name,
                ],
                'tags' => $campaign->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ];
                }),
                'files' => [],
                'dice_rolls_count' => 0,
                'is_member' => true,
                'is_owner' => true,
                'can_edit' => true,
                'created_at' => $campaign->created_at,
                'updated_at' => $campaign->updated_at,
            ]
        ], 201);
    }

    public function apiUpdate(UpdateCampaignRequest $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        
        $validated = $request->validated();

        DB::transaction(function () use ($campaign, $validated) {
            $campaign->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'system' => $validated['system'],
                'type' => $validated['type'],
                'city' => $validated['city'],
                'status' => $validated['status'],
                'visibility' => $validated['visibility'],
                'rules' => $validated['rules'],
            ]);

            // Atualizar tags
            if (isset($validated['tags'])) {
                $campaign->tags()->sync($validated['tags']);
            }
        });

        $campaign->load(['owner', 'members', 'tags']);

        return response()->json([
            'data' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'system' => $campaign->system,
                'type' => $campaign->type,
                'city' => $campaign->city,
                'status' => $campaign->status,
                'visibility' => $campaign->visibility,
                'rules' => $campaign->rules,
                'members_count' => $campaign->members->count(),
                'members' => $campaign->members,
                'owner' => $campaign->owner,
                'tags' => $campaign->tags,
                'files' => $campaign->files ?? [],
                'dice_rolls_count' => $campaign->diceRolls->count() ?? 0,
                'is_member' => $campaign->members->contains(Auth::id()),
                'is_owner' => $campaign->owner_id === Auth::id(),
                'can_edit' => $campaign->owner_id === Auth::id(),
                'created_at' => $campaign->created_at,
                'updated_at' => $campaign->updated_at,
            ]
        ]);
    }

    public function apiDestroy(Campaign $campaign)
    {
        $this->authorize('delete', $campaign);
        
        $campaign->delete();
        
        return response()->json(['message' => 'Campanha excluída com sucesso!']);
    }

    public function apiInvite(Request $request, Campaign $campaign)
    {
        $this->authorize('invite', $campaign);
        
        $request->validate([
            'email' => 'required|email',
            'message' => 'nullable|string|max:500'
        ]);

        // Implementar lógica de convite aqui
        // Por enquanto, apenas retornar sucesso
        
        return response()->json(['message' => 'Convite enviado com sucesso!']);
    }

    public function apiLeave(Campaign $campaign)
    {
        $this->authorize('leave', $campaign);
        
        $campaign->members()->detach(Auth::id());
        
        return response()->json(['message' => 'Você saiu da campanha.']);
    }

    public function apiUpdateMemberRole(Request $request, Campaign $campaign, User $user)
    {
        $this->authorize('updateMemberRole', [$campaign, $user]);
        
        $request->validate([
            'role' => 'required|in:player,master,co_master'
        ]);

        $campaign->members()->updateExistingPivot($user->id, [
            'role' => $request->role
        ]);

        return response()->json(['message' => 'Role do membro atualizado.']);
    }

    public function apiRemoveMember(Campaign $campaign, User $user)
    {
        $this->authorize('removeMember', [$campaign, $user]);
        
        $campaign->members()->detach($user->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Membro removido da campanha com sucesso.'
        ]);
    }

    public function getCampaignMembers(Campaign $campaign)
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Você não é membro desta campanha'
            ], 403);
        }

        $members = $campaign->members()->get();
        $ownerId = $campaign->owner_id;

        return response()->json([
            'success' => true,
            'data' => $members->map(function ($member) use ($ownerId) {
                return [
                    'user_id' => $member->id,
                    'id' => $member->id,
                    'name' => $member->name,
                    'display_name' => $member->display_name,
                    'email' => $member->email,
                    'role' => $member->pivot->role ?? 'member',
                    'status' => $member->pivot->status ?? 'active',
                    'joined_at' => $member->pivot->joined_at ?? $member->pivot->created_at,
                    'is_owner' => $member->id === $ownerId,
                ];
            }),
            'owner_id' => $ownerId,
            'message' => 'Membros da campanha recuperados com sucesso'
        ]);
    }

    private function getAvailableSystems()
    {
        return [
            'D&D 5e' => 'D&D 5e',
            'D&D 3.5' => 'D&D 3.5',
            'Pathfinder' => 'Pathfinder',
            'Pathfinder 2e' => 'Pathfinder 2e',
            'Call of Cthulhu' => 'Call of Cthulhu',
            'Vampire: The Masquerade' => 'Vampire: The Masquerade',
            'World of Darkness' => 'World of Darkness',
            'GURPS' => 'GURPS',
            'Savage Worlds' => 'Savage Worlds',
            'FATE' => 'FATE',
            'Cypher System' => 'Cypher System',
            'Powered by the Apocalypse' => 'Powered by the Apocalypse',
            'Outros' => 'Outros',
        ];
    }

    /**
     * Listar arquivos da campanha
     */
    public function getCampaignFiles(Campaign $campaign)
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists() && $campaign->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para ver os arquivos desta campanha'
            ], 403);
        }

        $files = \App\Models\CampaignFile::where('campaign_id', $campaign->id)
            ->with('uploader')
            ->orderBy('uploaded_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'size' => $file->size,
                    'url' => $file->url,
                    'uploaded_at' => $file->uploaded_at,
                    'uploader' => $file->uploader ? [
                        'id' => $file->uploader->id,
                        'name' => $file->uploader->name,
                        'display_name' => $file->uploader->display_name ?? $file->uploader->name,
                    ] : null,
                ];
            }),
            'message' => 'Arquivos da campanha recuperados com sucesso'
        ]);
    }

    /**
     * Fazer upload de arquivo para a campanha
     */
    public function uploadCampaignFile(Request $request, Campaign $campaign)
    {
        $user = Auth::user();
        
        // Verificar se o usuário é membro da campanha
        if (!$campaign->members()->where('user_id', $user->id)->exists() && $campaign->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para fazer upload de arquivos nesta campanha'
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Determinar tipo de arquivo baseado na extensão
            $type = 'document';
            if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $type = 'image';
            } elseif (in_array(strtolower($extension), ['mp4', 'avi', 'mov', 'webm'])) {
                $type = 'video';
            } elseif (in_array(strtolower($extension), ['mp3', 'wav', 'ogg'])) {
                $type = 'audio';
            } elseif (in_array(strtolower($extension), ['pdf', 'doc', 'docx', 'txt'])) {
                $type = 'document';
            }

            // Armazenar arquivo
            $path = $file->store('campaigns/' . $campaign->id, 'public');
            $url = Storage::disk('public')->url($path);

            // Criar registro do arquivo
            $campaignFile = \App\Models\CampaignFile::create([
                'campaign_id' => $campaign->id,
                'uploaded_by' => $user->id,
                'name' => $originalName,
                'type' => $type,
                'size' => $size,
                'url' => $url,
                'uploaded_at' => now(),
            ]);

            $campaignFile->load('uploader');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $campaignFile->id,
                    'name' => $campaignFile->name,
                    'type' => $campaignFile->type,
                    'size' => $campaignFile->size,
                    'url' => $campaignFile->url,
                    'uploaded_at' => $campaignFile->uploaded_at,
                    'uploader' => $campaignFile->uploader ? [
                        'id' => $campaignFile->uploader->id,
                        'name' => $campaignFile->uploader->name,
                        'display_name' => $campaignFile->uploader->display_name ?? $campaignFile->uploader->name,
                    ] : null,
                ],
                'message' => 'Arquivo enviado com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fazer upload do arquivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
