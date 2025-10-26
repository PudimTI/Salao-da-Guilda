<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Character;
use App\Models\Post;
use App\Models\Campaign;
use App\Models\Friendship;
use App\Models\UserPreference;
use App\Models\UserFilter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Obter dados completos do perfil do usuário
     */
    public function show(Request $request, $userId = null): JsonResponse
    {
        $userId = $userId ?? Auth::id();
        $user = User::with(['profile', 'preferences', 'filters'])
            ->findOrFail($userId);

        // Contar estatísticas
        $stats = $this->getUserStats($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'handle' => $user->handle,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->bio,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
            ],
            'profile' => $user->profile,
            'preferences' => $user->preferences,
            'filters' => $user->filters,
            'stats' => $stats
        ]);
    }

    /**
     * Atualizar perfil do usuário
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        \Log::info('ProfileController: Iniciando atualização de perfil', [
            'user_id' => $user->id,
            'request_data' => $request->all()
        ]);
        
        $request->validate([
            'display_name' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only(['display_name', 'bio']);

        // Upload do avatar se fornecido
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_url'] = Storage::url($avatarPath);
            \Log::info('ProfileController: Avatar salvo', ['path' => $avatarPath]);
        }

        // Atualizar apenas campos fornecidos
        foreach ($data as $key => $value) {
            if ($value !== null && $value !== '') {
                $user->$key = $value;
                \Log::info("ProfileController: Atualizando campo {$key}", ['value' => $value]);
            }
        }
        
        $user->save();
        \Log::info('ProfileController: Perfil salvo com sucesso');

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Obter personagens do usuário
     */
    public function characters($userId = null): JsonResponse
    {
        $userId = $userId ?? Auth::id();
        $characters = Character::where('user_id', $userId)
            ->with(['campaigns'])
            ->get();

        return response()->json([
            'characters' => $characters->map(function ($character) {
                return [
                    'id' => $character->id,
                    'name' => $character->name,
                    'system' => $character->system,
                    'level' => $character->level,
                    'class' => $character->class,
                    'race' => $character->race,
                    'available' => $character->available,
                    'campaigns_count' => $character->campaigns->count(),
                ];
            })
        ]);
    }

    /**
     * Obter posts do usuário
     */
    public function posts($userId = null): JsonResponse
    {
        $userId = $userId ?? Auth::id();
        $posts = Post::where('author_id', $userId)
            ->with(['author', 'media', 'likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'posts' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'author' => [
                        'id' => $post->author->id,
                        'display_name' => $post->author->display_name,
                        'handle' => $post->author->handle,
                        'avatar_url' => $post->author->avatar_url,
                    ],
                    'media' => $post->media,
                    'likes_count' => $post->likes->count(),
                    'comments_count' => $post->comments->count(),
                    'created_at' => $post->created_at,
                ];
            }),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Obter campanhas do usuário
     */
    public function campaigns($userId = null): JsonResponse
    {
        $userId = $userId ?? Auth::id();
        $user = User::findOrFail($userId);

        // Campanhas criadas pelo usuário
        $createdCampaigns = $user->campaigns()
            ->with(['members', 'tags'])
            ->get();

        // Campanhas onde o usuário é membro
        $memberCampaigns = $user->campaignMemberships()
            ->with(['members', 'tags'])
            ->get();

        return response()->json([
            'created_campaigns' => $createdCampaigns->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'system' => $campaign->system,
                    'status' => $campaign->status,
                    'max_players' => $campaign->max_players,
                    'current_players' => $campaign->members->count(),
                    'tags' => $campaign->tags->pluck('name'),
                ];
            }),
            'member_campaigns' => $memberCampaigns->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'system' => $campaign->system,
                    'status' => $campaign->status,
                    'role' => $campaign->pivot->role,
                    'joined_at' => $campaign->pivot->joined_at,
                ];
            })
        ]);
    }

    /**
     * Atualizar preferências do usuário
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'systems' => 'nullable|array',
            'styles' => 'nullable|array',
            'dynamics' => 'nullable|array',
        ]);

        $preferences = UserPreference::firstOrCreate(['user_id' => $user->id]);
        $preferencesData = $request->only(['systems', 'styles', 'dynamics']);
        foreach ($preferencesData as $key => $value) {
            $preferences->$key = $value;
        }
        $preferences->save();

        return response()->json([
            'message' => 'Preferências atualizadas com sucesso',
            'preferences' => $preferences
        ]);
    }

    /**
     * Atualizar filtros do usuário
     */
    public function updateFilters(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'whitelist_tags' => 'nullable|array',
            'blacklist_tags' => 'nullable|array',
        ]);

        $filters = UserFilter::firstOrCreate(['user_id' => $user->id]);
        $filtersData = $request->only(['whitelist_tags', 'blacklist_tags']);
        foreach ($filtersData as $key => $value) {
            $filters->$key = $value;
        }
        $filters->save();

        return response()->json([
            'message' => 'Filtros atualizados com sucesso',
            'filters' => $filters
        ]);
    }

    /**
     * Obter estatísticas do usuário
     */
    private function getUserStats(User $user): array
    {
        return [
            'characters_count' => $user->characters()->count(),
            'campaigns_created' => $user->campaigns()->count(),
            'campaigns_joined' => $user->campaignMemberships()->count(),
            'posts_count' => $user->posts()->count(),
            'connections_count' => $user->friendships()->count(),
            'total_campaigns' => $user->campaigns()->count() + $user->campaignMemberships()->count(),
        ];
    }
}
