<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\Campaign;
use App\Http\Requests\StoreCharacterRequest;
use App\Http\Requests\UpdateCharacterRequest;
use App\Http\Requests\JoinCampaignRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CharacterController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $characters = Auth::user()->characters()->orderBy('created_at', 'desc')->get();
        
        return view('characters.index-react', compact('characters'));
    }

    public function create()
    {
        $systems = $this->getAvailableSystems();
        $campaigns = Campaign::where('owner_id', Auth::id())
            ->orWhereHas('members', function($query) {
                $query->where('user_id', Auth::id());
            })
            ->where('status', 'active')
            ->get();
            
        return view('characters.create', compact('systems', 'campaigns'));
    }

    public function store(StoreCharacterRequest $request)
    {
        $validated = $request->validated();

        $character = Auth::user()->characters()->create([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'summary' => $validated['summary'],
            'backstory' => $validated['backstory'],
            'system' => $validated['system'],
        ]);

        // Associar com campanhas se fornecidas
        if (!empty($validated['campaign_ids'])) {
            $campaignData = [];
            foreach ($validated['campaign_ids'] as $index => $campaignId) {
                $campaignData[$campaignId] = [
                    'player_id' => Auth::id(),
                    'joined_at' => now(),
                    'role_note' => $validated['role_notes'][$index] ?? null,
                ];
            }
            $character->campaigns()->attach($campaignData);
        }

        return redirect()->route('characters.show', $character)
            ->with('success', 'Personagem criado com sucesso!');
    }

    public function show(Character $character)
    {
        $this->authorize('view', $character);
        
        $character->load(['campaigns', 'user']);
        
        return view('characters.show', compact('character'));
    }

    public function edit(Character $character)
    {
        $this->authorize('update', $character);
        
        $systems = $this->getAvailableSystems();
        $campaigns = Campaign::where('owner_id', Auth::id())
            ->orWhereHas('members', function($query) {
                $query->where('user_id', Auth::id());
            })
            ->where('status', 'active')
            ->get();
            
        $characterCampaigns = $character->campaigns()->get()->keyBy('id');
        
        return view('characters.edit', compact('character', 'systems', 'campaigns', 'characterCampaigns'));
    }

    public function update(UpdateCharacterRequest $request, Character $character)
    {
        $this->authorize('update', $character);
        
        $validated = $request->validated();

        $character->update([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'summary' => $validated['summary'],
            'backstory' => $validated['backstory'],
            'system' => $validated['system'],
        ]);

        // Atualizar associações com campanhas
        $character->campaigns()->detach();
        
        if (!empty($validated['campaign_ids'])) {
            $campaignData = [];
            foreach ($validated['campaign_ids'] as $index => $campaignId) {
                $campaignData[$campaignId] = [
                    'player_id' => Auth::id(),
                    'joined_at' => now(),
                    'role_note' => $validated['role_notes'][$index] ?? null,
                ];
            }
            $character->campaigns()->attach($campaignData);
        }

        return redirect()->route('characters.show', $character)
            ->with('success', 'Personagem atualizado com sucesso!');
    }

    public function destroy(Character $character)
    {
        $this->authorize('delete', $character);
        
        $character->delete();
        
        return redirect()->route('characters.index')
            ->with('success', 'Personagem excluído com sucesso!');
    }

    public function joinCampaign(JoinCampaignRequest $request, Character $character)
    {
        $this->authorize('update', $character);
        
        $validated = $request->validated();

        $character->campaigns()->attach($validated['campaign_id'], [
            'player_id' => Auth::id(),
            'joined_at' => now(),
            'role_note' => $validated['role_note'],
        ]);

        return back()->with('success', 'Personagem adicionado à campanha com sucesso!');
    }

    public function leaveCampaign(Character $character, Campaign $campaign)
    {
        $this->authorize('update', $character);
        
        $character->campaigns()->detach($campaign->id);
        
        return back()->with('success', 'Personagem removido da campanha com sucesso!');
    }

    // Métodos de API para componentes React
    public function apiIndex()
    {
        $characters = Auth::user()->characters()->with(['campaigns', 'user'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'data' => $characters->map(function ($character) {
                return [
                    'id' => $character->id,
                    'name' => $character->name,
                    'level' => $character->level,
                    'system' => $character->system,
                    'summary' => $character->summary,
                    'backstory' => $character->backstory,
                    'available' => $character->isAvailable(),
                    'campaigns_count' => $character->getActiveCampaignsCount(),
                    'campaigns' => $character->campaigns->map(function ($campaign) {
                        return [
                            'id' => $campaign->id,
                            'name' => $campaign->name,
                            'system' => $campaign->system,
                            'status' => $campaign->status,
                            'role_note' => $campaign->pivot->role_note,
                            'joined_at' => $campaign->pivot->joined_at,
                        ];
                    }),
                    'user' => [
                        'id' => $character->user->id,
                        'name' => $character->user->name,
                        'display_name' => $character->user->display_name,
                        'handle' => $character->user->handle,
                    ],
                    'created_at' => $character->created_at,
                    'updated_at' => $character->updated_at,
                ];
            })
        ]);
    }

    public function apiShow(Character $character)
    {
        $this->authorize('view', $character);
        
        $character->load(['campaigns', 'user']);
        
        return response()->json([
            'data' => [
                'id' => $character->id,
                'name' => $character->name,
                'level' => $character->level,
                'system' => $character->system,
                'summary' => $character->summary,
                'backstory' => $character->backstory,
                'available' => $character->isAvailable(),
                'campaigns_count' => $character->getActiveCampaignsCount(),
                'campaigns' => $character->campaigns->map(function ($campaign) {
                    return [
                        'id' => $campaign->id,
                        'name' => $campaign->name,
                        'system' => $campaign->system,
                        'type' => $campaign->type,
                        'status' => $campaign->status,
                        'role_note' => $campaign->pivot->role_note,
                        'joined_at' => $campaign->pivot->joined_at,
                    ];
                }),
                'user' => [
                    'id' => $character->user->id,
                    'name' => $character->user->name,
                    'display_name' => $character->user->display_name,
                    'handle' => $character->user->handle,
                ],
                'created_at' => $character->created_at,
                'updated_at' => $character->updated_at,
            ]
        ]);
    }

    public function apiStore(StoreCharacterRequest $request)
    {
        $validated = $request->validated();

        $character = Auth::user()->characters()->create([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'summary' => $validated['summary'],
            'backstory' => $validated['backstory'],
            'system' => $validated['system'],
        ]);

        // Associar com campanhas se fornecidas
        if (!empty($validated['campaign_ids'])) {
            $campaignData = [];
            foreach ($validated['campaign_ids'] as $index => $campaignId) {
                $campaignData[$campaignId] = [
                    'player_id' => Auth::id(),
                    'joined_at' => now(),
                    'role_note' => $validated['role_notes'][$index] ?? null,
                ];
            }
            $character->campaigns()->attach($campaignData);
        }

        $character->load(['campaigns', 'user']);

        return response()->json([
            'data' => [
                'id' => $character->id,
                'name' => $character->name,
                'level' => $character->level,
                'system' => $character->system,
                'summary' => $character->summary,
                'backstory' => $character->backstory,
                'available' => $character->isAvailable(),
                'campaigns_count' => $character->getActiveCampaignsCount(),
                'campaigns' => $character->campaigns,
                'user' => $character->user,
                'created_at' => $character->created_at,
                'updated_at' => $character->updated_at,
            ]
        ], 201);
    }

    public function apiUpdate(UpdateCharacterRequest $request, Character $character)
    {
        $this->authorize('update', $character);
        
        $validated = $request->validated();

        $character->update([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'summary' => $validated['summary'],
            'backstory' => $validated['backstory'],
            'system' => $validated['system'],
        ]);

        // Atualizar associações com campanhas
        $character->campaigns()->detach();
        
        if (!empty($validated['campaign_ids'])) {
            $campaignData = [];
            foreach ($validated['campaign_ids'] as $index => $campaignId) {
                $campaignData[$campaignId] = [
                    'player_id' => Auth::id(),
                    'joined_at' => now(),
                    'role_note' => $validated['role_notes'][$index] ?? null,
                ];
            }
            $character->campaigns()->attach($campaignData);
        }

        $character->load(['campaigns', 'user']);

        return response()->json([
            'data' => [
                'id' => $character->id,
                'name' => $character->name,
                'level' => $character->level,
                'system' => $character->system,
                'summary' => $character->summary,
                'backstory' => $character->backstory,
                'available' => $character->isAvailable(),
                'campaigns_count' => $character->getActiveCampaignsCount(),
                'campaigns' => $character->campaigns,
                'user' => $character->user,
                'created_at' => $character->created_at,
                'updated_at' => $character->updated_at,
            ]
        ]);
    }

    public function apiDestroy(Character $character)
    {
        $this->authorize('delete', $character);
        
        $character->delete();
        
        return response()->json(['message' => 'Personagem excluído com sucesso!']);
    }

    public function apiJoinCampaign(JoinCampaignRequest $request, Character $character)
    {
        $this->authorize('update', $character);
        
        $validated = $request->validated();

        $character->campaigns()->attach($validated['campaign_id'], [
            'player_id' => Auth::id(),
            'joined_at' => now(),
            'role_note' => $validated['role_note'],
        ]);

        return response()->json(['message' => 'Personagem adicionado à campanha com sucesso!']);
    }

    public function apiLeaveCampaign(Character $character, Campaign $campaign)
    {
        $this->authorize('update', $character);
        
        $character->campaigns()->detach($campaign->id);
        
        return response()->json(['message' => 'Personagem removido da campanha com sucesso!']);
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
}
