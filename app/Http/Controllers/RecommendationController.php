<?php

namespace App\Http\Controllers;

use App\Models\Recommendation;
use App\Models\User;
use App\Services\RecommendationService;
use App\Http\Resources\RecommendationResource;
use App\Http\Resources\RecommendationCollection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RecommendationController extends Controller
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {}

    /**
     * Listar recomendações do usuário autenticado
     * 
     * GET /api/recommendations
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'limit' => 'integer|min:1|max:50',
            'type' => 'string|in:campaign,post,all',
            'min_score' => 'numeric|min:0|max:1',
            'refresh' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros inválidos',
                'errors' => $validator->errors()
            ], 400);
        }

        $limit = $request->get('limit', 10);
        $type = $request->get('type', 'all');
        $minScore = $request->get('min_score', 0.1);
        $refresh = $request->get('refresh', false);

        try {
            // Limpar cache se solicitado
            if ($refresh) {
                $this->recommendationService->clearUserCache($user->id);
            }

            // Buscar recomendações do banco ou gerar novas
            $recommendations = $this->getUserRecommendations($user->id, $limit, $type, $minScore);

            return response()->json([
                'success' => true,
                'data' => new RecommendationCollection($recommendations),
                'message' => 'Recomendações recuperadas com sucesso',
                'meta' => [
                    'total' => $recommendations->count(),
                    'user_id' => $user->id,
                    'generated_at' => $recommendations->first()?->generated_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao buscar recomendações', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno'
            ], 500);
        }
    }

    /**
     * Gerar novas recomendações para o usuário
     * 
     * POST /api/recommendations/generate
     */
    public function generate(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'limit' => 'integer|min:1|max:50',
            'force' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros inválidos',
                'errors' => $validator->errors()
            ], 400);
        }

        $limit = $request->get('limit', 10);
        $force = $request->get('force', false);

        try {
            // Verificar se já existem recomendações recentes (a menos que force seja true)
            if (!$force) {
                $existingRecommendations = Recommendation::where('user_id', $user->id)
                    ->where('generated_at', '>=', now()->subHours(1))
                    ->count();

                if ($existingRecommendations > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Recomendações já foram geradas recentemente. Use force=true para forçar nova geração.',
                        'existing_count' => $existingRecommendations
                    ], 409);
                }
            }

            // Gerar novas recomendações
            $recommendations = $this->recommendationService->generateRecommendations($user->id, $limit);
            
            if (empty($recommendations)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhuma recomendação encontrada com base no seu perfil atual'
                ], 404);
            }

            // Salvar no banco
            $this->recommendationService->saveRecommendations($user->id, $recommendations);

            // Buscar recomendações salvas
            $savedRecommendations = Recommendation::where('user_id', $user->id)
                ->orderBy('score', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => new RecommendationCollection($savedRecommendations),
                'message' => 'Recomendações geradas com sucesso',
                'meta' => [
                    'generated_count' => count($recommendations),
                    'user_id' => $user->id,
                    'generated_at' => now()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao gerar recomendações', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar recomendações',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno'
            ], 500);
        }
    }

    /**
     * Marcar recomendação como visualizada
     * 
     * POST /api/recommendations/{recommendation}/view
     */
    public function markAsViewed(Recommendation $recommendation): JsonResponse
    {
        $user = Auth::user();

        // Verificar se a recomendação pertence ao usuário
        if ($recommendation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Recomendação não encontrada'
            ], 404);
        }

        try {
            // Registrar visualização como evento de interação
            \App\Models\InteractionEvent::create([
                'user_id' => $user->id,
                'target_type' => $recommendation->target_type,
                'target_id' => $recommendation->target_id,
                'action' => 'view',
                'metadata' => ['recommendation_id' => $recommendation->id]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Recomendação marcada como visualizada'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao marcar recomendação como visualizada', [
                'user_id' => $user->id,
                'recommendation_id' => $recommendation->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar solicitação'
            ], 500);
        }
    }

    /**
     * Obter estatísticas de recomendações do usuário
     * 
     * GET /api/recommendations/stats
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();

        try {
            $stats = [
                'total_recommendations' => Recommendation::where('user_id', $user->id)->count(),
                'active_recommendations' => Recommendation::where('user_id', $user->id)
                    ->where('valid_until', '>', now())
                    ->count(),
                'campaign_recommendations' => Recommendation::where('user_id', $user->id)
                    ->where('target_type', 'campaign')
                    ->count(),
                'post_recommendations' => Recommendation::where('user_id', $user->id)
                    ->where('target_type', 'post')
                    ->count(),
                'avg_score' => Recommendation::where('user_id', $user->id)
                    ->avg('score'),
                'last_generated' => Recommendation::where('user_id', $user->id)
                    ->max('generated_at')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estatísticas recuperadas com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao buscar estatísticas de recomendações', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar estatísticas'
            ], 500);
        }
    }

    /**
     * Limpar cache de recomendações do usuário
     * 
     * DELETE /api/recommendations/cache
     */
    public function clearCache(): JsonResponse
    {
        $user = Auth::user();

        try {
            $this->recommendationService->clearUserCache($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Cache de recomendações limpo com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao limpar cache de recomendações', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao limpar cache'
            ], 500);
        }
    }

    /**
     * Buscar recomendações do usuário com filtros
     */
    private function getUserRecommendations(int $userId, int $limit, string $type, float $minScore)
    {
        $query = Recommendation::where('user_id', $userId)
            ->where('score', '>=', $minScore)
            ->where('valid_until', '>', now());

        // Filtrar por tipo se especificado
        if ($type !== 'all') {
            $query->where('target_type', $type);
        }

        return $query->orderBy('score', 'desc')
            ->limit($limit)
            ->get();
    }
}
