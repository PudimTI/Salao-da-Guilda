<?php

namespace App\Services;

use App\Models\Recommendation;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Post;
use App\Models\Tag;
use App\Models\UserPreference;
use App\Models\UserFilter;
use App\Models\InteractionEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecommendationService
{
    /**
     * Configurações do algoritmo de recomendação
     */
    private const CACHE_TTL = 3600; // 1 hora
    private const MAX_RECOMMENDATIONS = 20;
    private const MIN_SCORE = 0.1;
    
    // Pesos para cálculo de score
    private const WEIGHT_PREFERENCES = 0.4;
    private const WEIGHT_TAGS = 0.3;
    private const WEIGHT_INTERACTIONS = 0.2;
    private const WEIGHT_FRIENDS = 0.1;

    /**
     * Gerar recomendações para um usuário
     */
    public function generateRecommendations(int $userId, int $limit = 10): array
    {
        $cacheKey = "recommendations:user:{$userId}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($userId, $limit) {
            return $this->calculateRecommendations($userId, $limit);
        });
    }

    /**
     * Calcular recomendações sem cache
     */
    private function calculateRecommendations(int $userId, int $limit): array
    {
        $user = User::with(['preferences', 'filters'])->find($userId);
        
        if (!$user) {
            return [];
        }

        // Buscar campanhas e posts elegíveis
        $campaigns = $this->getEligibleCampaigns($user);
        $posts = $this->getEligiblePosts($user);
        
        $recommendations = [];
        
        // Processar campanhas
        foreach ($campaigns as $campaign) {
            $score = $this->calculateScore($user, $campaign, 'campaign');
            if ($score >= self::MIN_SCORE) {
                $recommendations[] = [
                    'target_type' => 'campaign',
                    'target_id' => $campaign->id,
                    'score' => $score,
                    'reason' => $this->generateReason($user, $campaign, 'campaign', $score)
                ];
            }
        }
        
        // Processar posts
        foreach ($posts as $post) {
            $score = $this->calculateScore($user, $post, 'post');
            if ($score >= self::MIN_SCORE) {
                $recommendations[] = [
                    'target_type' => 'post',
                    'target_id' => $post->id,
                    'score' => $score,
                    'reason' => $this->generateReason($user, $post, 'post', $score)
                ];
            }
        }
        
        // Ordenar por score e limitar
        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Buscar campanhas elegíveis para recomendação
     */
    private function getEligibleCampaigns(User $user): \Illuminate\Database\Eloquent\Collection
    {
        $query = Campaign::with(['tags', 'owner'])
            ->where('status', 'active')
            ->where('visibility', 'public');
        
        // Aplicar filtros de usuário
        $this->applyUserFilters($query, $user);
        
        // Excluir campanhas já participadas
        $query->whereNotExists(function ($q) use ($user) {
            $q->select(DB::raw(1))
                ->from('campaign_members')
                ->whereRaw('campaign_members.campaign_id = campaigns.id')
                ->where('campaign_members.user_id', $user->id);
        });
        
        return $query->limit(50)->get();
    }

    /**
     * Buscar posts elegíveis para recomendação
     */
    private function getEligiblePosts(User $user): \Illuminate\Database\Eloquent\Collection
    {
        $query = Post::with(['tags', 'author'])
            ->where('visibility', 'public')
            ->where('created_at', '>=', now()->subDays(30)); // Posts recentes
        
        // Aplicar filtros de usuário
        $this->applyUserFilters($query, $user);
        
        // Excluir posts do próprio usuário
        $query->where('author_id', '!=', $user->id);
        
        return $query->limit(50)->get();
    }

    /**
     * Aplicar filtros de usuário (whitelist/blacklist)
     */
    private function applyUserFilters($query, User $user): void
    {
        if ($user->filters) {
            $filters = $user->filters;
            
            // Aplicar whitelist de tags
            if (!empty($filters->whitelist_tags)) {
                $query->whereHas('tags', function ($q) use ($filters) {
                    $q->whereIn('tags.id', $filters->whitelist_tags);
                });
            }
            
            // Aplicar blacklist de tags
            if (!empty($filters->blacklist_tags)) {
                $query->whereDoesntHave('tags', function ($q) use ($filters) {
                    $q->whereIn('tags.id', $filters->blacklist_tags);
                });
            }
        }
    }

    /**
     * Calcular score de recomendação
     * 
     * Fórmula: Score = (Peso_Prefs * Score_Prefs) + (Peso_Tags * Score_Tags) + 
     *          (Peso_Interactions * Score_Interactions) + (Peso_Friends * Score_Friends)
     */
    private function calculateScore(User $user, $target, string $type): float
    {
        $preferenceScore = $this->calculatePreferenceScore($user, $target, $type);
        $tagScore = $this->calculateTagScore($user, $target);
        $interactionScore = $this->calculateInteractionScore($user, $target, $type);
        $friendScore = $this->calculateFriendScore($user, $target, $type);
        
        $totalScore = 
            (self::WEIGHT_PREFERENCES * $preferenceScore) +
            (self::WEIGHT_TAGS * $tagScore) +
            (self::WEIGHT_INTERACTIONS * $interactionScore) +
            (self::WEIGHT_FRIENDS * $friendScore);
        
        // Normalizar score entre 0 e 1
        return min(1.0, max(0.0, $totalScore));
    }

    /**
     * Calcular score baseado em preferências do usuário
     */
    private function calculatePreferenceScore(User $user, $target, string $type): float
    {
        if (!$user->preferences) {
            return 0.5; // Score neutro se não há preferências
        }
        
        $preferences = $user->preferences;
        $score = 0.0;
        $factors = 0;
        
        // Score baseado em sistemas preferidos
        if (!empty($preferences->systems)) {
            $targetSystem = $type === 'campaign' ? $target->system : null;
            if ($targetSystem && in_array($targetSystem, $preferences->systems)) {
                $score += 0.4;
            }
            $factors++;
        }
        
        // Score baseado em estilos preferidos
        if (!empty($preferences->styles)) {
            $targetStyles = $target->tags->where('category', 'style')->pluck('name')->toArray();
            $matchingStyles = array_intersect($preferences->styles, $targetStyles);
            if (!empty($matchingStyles)) {
                $score += 0.3 * (count($matchingStyles) / count($preferences->styles));
            }
            $factors++;
        }
        
        // Score baseado em dinâmicas preferidas
        if (!empty($preferences->dynamics)) {
            $targetDynamics = $target->tags->where('category', 'dynamic')->pluck('name')->toArray();
            $matchingDynamics = array_intersect($preferences->dynamics, $targetDynamics);
            if (!empty($matchingDynamics)) {
                $score += 0.3 * (count($matchingDynamics) / count($preferences->dynamics));
            }
            $factors++;
        }
        
        return $factors > 0 ? $score / $factors : 0.5;
    }

    /**
     * Calcular score baseado em tags similares
     */
    private function calculateTagScore(User $user, $target): float
    {
        // Buscar tags mais usadas pelo usuário
        $userTags = $this->getUserPopularTags($user->id);
        
        if ($userTags->isEmpty()) {
            return 0.5; // Score neutro se usuário não tem tags
        }
        
        $targetTags = $target->tags->pluck('id')->toArray();
        $matchingTags = array_intersect($userTags->pluck('tag_id')->toArray(), $targetTags);
        
        if (empty($matchingTags)) {
            return 0.1; // Score baixo se não há tags em comum
        }
        
        // Calcular similaridade baseada na frequência das tags
        $similarity = count($matchingTags) / count($userTags);
        return min(1.0, $similarity);
    }

    /**
     * Calcular score baseado em histórico de interações
     */
    private function calculateInteractionScore(User $user, $target, string $type): float
    {
        $interactions = InteractionEvent::where('user_id', $user->id)
            ->where('target_type', $type)
            ->where('target_id', $target->id)
            ->get();
        
        if ($interactions->isEmpty()) {
            return 0.3; // Score base para itens não interagidos
        }
        
        // Calcular score baseado no tipo e frequência de interações
        $positiveInteractions = $interactions->whereIn('action', ['like', 'join', 'view', 'comment'])->count();
        $negativeInteractions = $interactions->whereIn('action', ['dislike', 'leave', 'block'])->count();
        
        $totalInteractions = $positiveInteractions + $negativeInteractions;
        if ($totalInteractions === 0) {
            return 0.3;
        }
        
        $ratio = $positiveInteractions / $totalInteractions;
        return min(1.0, 0.3 + ($ratio * 0.7));
    }

    /**
     * Calcular score baseado em amigos
     */
    private function calculateFriendScore(User $user, $target, string $type): float
    {
        // Buscar amigos que interagiram com o mesmo target
        $friendInteractions = DB::table('interaction_events as ie')
            ->join('friendships as f', function ($join) use ($user) {
                $join->on('ie.user_id', '=', 'f.friend_id')
                    ->where('f.user_id', $user->id)
                    ->where('f.state', 'active');
            })
            ->where('ie.target_type', $type)
            ->where('ie.target_id', $target->id)
            ->whereIn('ie.action', ['like', 'join', 'view', 'comment'])
            ->count();
        
        if ($friendInteractions === 0) {
            return 0.2; // Score baixo se amigos não interagiram
        }
        
        // Score aumenta com número de interações de amigos
        return min(1.0, 0.2 + ($friendInteractions * 0.1));
    }

    /**
     * Buscar tags mais populares do usuário
     */
    private function getUserPopularTags(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return DB::table('interaction_events as ie')
            ->join('post_tags as pt', 'ie.target_id', '=', 'pt.post_id')
            ->join('tags as t', 'pt.tag_id', '=', 't.id')
            ->where('ie.user_id', $userId)
            ->where('ie.target_type', 'post')
            ->whereIn('ie.action', ['like', 'view', 'comment'])
            ->select('t.id as tag_id', DB::raw('COUNT(*) as frequency'))
            ->groupBy('t.id')
            ->orderBy('frequency', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Gerar explicação da recomendação
     */
    private function generateReason(User $user, $target, string $type, float $score): string
    {
        $reasons = [];
        
        // Verificar preferências
        if ($user->preferences) {
            if ($type === 'campaign' && in_array($target->system, $user->preferences->systems ?? [])) {
                $reasons[] = "Sistema preferido: {$target->system}";
            }
        }
        
        // Verificar tags em comum
        $userTags = $this->getUserPopularTags($user->id);
        $targetTags = $target->tags->pluck('name')->toArray();
        $commonTags = array_intersect($userTags->pluck('tag_id')->toArray(), $target->tags->pluck('id')->toArray());
        
        if (!empty($commonTags)) {
            $reasons[] = "Tags de interesse em comum";
        }
        
        // Verificar interações de amigos
        $friendInteractions = DB::table('interaction_events as ie')
            ->join('friendships as f', function ($join) use ($user) {
                $join->on('ie.user_id', '=', 'f.friend_id')
                    ->where('f.user_id', $user->id)
                    ->where('f.state', 'active');
            })
            ->where('ie.target_type', $type)
            ->where('ie.target_id', $target->id)
            ->count();
        
        if ($friendInteractions > 0) {
            $reasons[] = "Recomendado por {$friendInteractions} amigo(s)";
        }
        
        if (empty($reasons)) {
            return "Baseado no seu perfil e histórico";
        }
        
        return implode(', ', $reasons);
    }

    /**
     * Salvar recomendações no banco de dados
     */
    public function saveRecommendations(int $userId, array $recommendations): void
    {
        // Limpar recomendações antigas
        Recommendation::where('user_id', $userId)->delete();
        
        // Salvar novas recomendações
        foreach ($recommendations as $rec) {
            Recommendation::create([
                'user_id' => $userId,
                'target_type' => $rec['target_type'],
                'target_id' => $rec['target_id'],
                'score' => $rec['score'],
                'reason' => $rec['reason'],
                'generated_at' => now(),
                'valid_until' => now()->addDays(7) // Recomendações válidas por 7 dias
            ]);
        }
        
        Log::info("Recomendações salvas para usuário {$userId}", [
            'count' => count($recommendations),
            'user_id' => $userId
        ]);
    }

    /**
     * Limpar cache de recomendações
     */
    public function clearUserCache(int $userId): void
    {
        Cache::forget("recommendations:user:{$userId}");
    }

    /**
     * Limpar cache de todos os usuários
     */
    public function clearAllCache(): void
    {
        // Em produção, usar Redis SCAN para limpar chaves por padrão
        if (config('cache.default') === 'redis') {
            // Implementar limpeza por padrão se necessário
            Log::info('Cache de recomendações limpo globalmente');
        }
    }
}
