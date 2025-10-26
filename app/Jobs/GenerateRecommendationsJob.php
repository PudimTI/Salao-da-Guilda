<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateRecommendationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número máximo de tentativas
     */
    public int $tries = 3;

    /**
     * Timeout do job em segundos
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private ?int $userId = null,
        private int $limit = 20,
        private bool $force = false
    ) {}

    /**
     * Execute the job.
     */
    public function handle(RecommendationService $recommendationService): void
    {
        try {
            if ($this->userId) {
                // Gerar recomendações para usuário específico
                $this->generateForUser($recommendationService, $this->userId);
            } else {
                // Gerar recomendações para todos os usuários ativos
                $this->generateForAllUsers($recommendationService);
            }

            Log::info('Job de geração de recomendações executado com sucesso', [
                'user_id' => $this->userId,
                'limit' => $this->limit,
                'force' => $this->force
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao executar job de geração de recomendações', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Gerar recomendações para um usuário específico
     */
    private function generateForUser(RecommendationService $service, int $userId): void
    {
        $user = User::find($userId);
        
        if (!$user) {
            Log::warning('Usuário não encontrado para geração de recomendações', [
                'user_id' => $userId
            ]);
            return;
        }

        // Verificar se já existem recomendações recentes (a menos que force seja true)
        if (!$this->force) {
            $existingCount = \App\Models\Recommendation::where('user_id', $userId)
                ->where('generated_at', '>=', now()->subHours(6))
                ->count();

            if ($existingCount > 0) {
                Log::info('Recomendações já existem para o usuário', [
                    'user_id' => $userId,
                    'existing_count' => $existingCount
                ]);
                return;
            }
        }

        // Gerar e salvar recomendações
        $recommendations = $service->generateRecommendations($userId, $this->limit);
        
        if (!empty($recommendations)) {
            $service->saveRecommendations($userId, $recommendations);
            
            Log::info('Recomendações geradas para usuário', [
                'user_id' => $userId,
                'count' => count($recommendations)
            ]);
        } else {
            Log::info('Nenhuma recomendação gerada para usuário', [
                'user_id' => $userId
            ]);
        }
    }

    /**
     * Gerar recomendações para todos os usuários ativos
     */
    private function generateForAllUsers(RecommendationService $service): void
    {
        // Buscar usuários ativos que fizeram login nos últimos 30 dias
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        $processed = 0;
        $errors = 0;

        foreach ($activeUsers as $userId) {
            try {
                $this->generateForUser($service, $userId);
                $processed++;
                
                // Pequena pausa para não sobrecarregar o sistema
                usleep(100000); // 0.1 segundo
                
            } catch (\Exception $e) {
                $errors++;
                Log::error('Erro ao gerar recomendações para usuário', [
                    'user_id' => $userId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Geração em lote de recomendações concluída', [
            'total_users' => count($activeUsers),
            'processed' => $processed,
            'errors' => $errors
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Job de geração de recomendações falhou definitivamente', [
            'user_id' => $this->userId,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
