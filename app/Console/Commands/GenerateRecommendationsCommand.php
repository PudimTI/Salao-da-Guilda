<?php

namespace App\Console\Commands;

use App\Jobs\GenerateRecommendationsJob;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateRecommendationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recommendations:generate 
                            {--user= : ID do usuário específico para gerar recomendações}
                            {--limit=20 : Número máximo de recomendações por usuário}
                            {--force : Forçar geração mesmo se já existem recomendações recentes}
                            {--batch : Processar em lotes para usuários ativos}
                            {--clear-cache : Limpar cache antes de gerar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gerar recomendações para usuários do sistema';

    /**
     * Execute the console command.
     */
    public function handle(RecommendationService $recommendationService): int
    {
        $this->info('🚀 Iniciando geração de recomendações...');

        try {
            // Limpar cache se solicitado
            if ($this->option('clear-cache')) {
                $this->info('🧹 Limpando cache de recomendações...');
                $recommendationService->clearAllCache();
                $this->info('✅ Cache limpo com sucesso');
            }

            $userId = $this->option('user');
            $limit = (int) $this->option('limit');
            $force = $this->option('force');
            $batch = $this->option('batch');

            if ($userId) {
                // Gerar para usuário específico
                $this->generateForUser($recommendationService, (int) $userId, $limit, $force);
            } elseif ($batch) {
                // Processar em lotes
                $this->generateBatch($recommendationService, $limit, $force);
            } else {
                // Gerar para todos os usuários ativos
                $this->generateForAllUsers($recommendationService, $limit, $force);
            }

            $this->info('✅ Geração de recomendações concluída com sucesso!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Erro ao gerar recomendações: ' . $e->getMessage());
            Log::error('Erro no comando de geração de recomendações', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Gerar recomendações para um usuário específico
     */
    private function generateForUser(RecommendationService $service, int $userId, int $limit, bool $force): void
    {
        $this->info("👤 Gerando recomendações para usuário ID: {$userId}");

        $user = User::find($userId);
        if (!$user) {
            $this->error("❌ Usuário com ID {$userId} não encontrado");
            return;
        }

        // Verificar recomendações existentes
        if (!$force) {
            $existingCount = \App\Models\Recommendation::where('user_id', $userId)
                ->where('generated_at', '>=', now()->subHours(6))
                ->count();

            if ($existingCount > 0) {
                $this->warn("⚠️  Usuário já possui {$existingCount} recomendações recentes. Use --force para forçar.");
                return;
            }
        }

        // Gerar recomendações
        $recommendations = $service->generateRecommendations($userId, $limit);
        
        if (empty($recommendations)) {
            $this->warn("⚠️  Nenhuma recomendação gerada para o usuário {$userId}");
            return;
        }

        // Salvar no banco
        $service->saveRecommendations($userId, $recommendations);

        $this->info("✅ Geradas " . count($recommendations) . " recomendações para usuário {$userId}");
    }

    /**
     * Gerar recomendações para todos os usuários ativos
     */
    private function generateForAllUsers(RecommendationService $service, int $limit, bool $force): void
    {
        $this->info('👥 Gerando recomendações para todos os usuários ativos...');

        // Buscar usuários ativos
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))
            ->where('status', 'active')
            ->get();

        if ($activeUsers->isEmpty()) {
            $this->warn('⚠️  Nenhum usuário ativo encontrado');
            return;
        }

        $this->info("📊 Encontrados {$activeUsers->count()} usuários ativos");

        $progressBar = $this->output->createProgressBar($activeUsers->count());
        $progressBar->start();

        $processed = 0;
        $errors = 0;

        foreach ($activeUsers as $user) {
            try {
                // Verificar se já existem recomendações recentes
                if (!$force) {
                    $existingCount = \App\Models\Recommendation::where('user_id', $user->id)
                        ->where('generated_at', '>=', now()->subHours(6))
                        ->count();

                    if ($existingCount > 0) {
                        $progressBar->advance();
                        continue;
                    }
                }

                // Gerar recomendações
                $recommendations = $service->generateRecommendations($user->id, $limit);
                
                if (!empty($recommendations)) {
                    $service->saveRecommendations($user->id, $recommendations);
                    $processed++;
                }

            } catch (\Exception $e) {
                $errors++;
                Log::error('Erro ao gerar recomendações para usuário', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("✅ Processamento concluído:");
        $this->info("   - Usuários processados: {$processed}");
        $this->info("   - Erros: {$errors}");
    }

    /**
     * Gerar recomendações em lotes usando jobs
     */
    private function generateBatch(RecommendationService $service, int $limit, bool $force): void
    {
        $this->info('🔄 Processando geração em lotes...');

        // Buscar usuários ativos
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        if (empty($activeUsers)) {
            $this->warn('⚠️  Nenhum usuário ativo encontrado');
            return;
        }

        $this->info("📊 Encontrados " . count($activeUsers) . " usuários ativos");

        // Despachar jobs em lotes
        $batchSize = 50;
        $batches = array_chunk($activeUsers, $batchSize);

        foreach ($batches as $index => $batch) {
            $this->info("🚀 Despachando lote " . ($index + 1) . " com " . count($batch) . " usuários...");
            
            foreach ($batch as $userId) {
                GenerateRecommendationsJob::dispatch($userId, $limit, $force);
            }

            // Pequena pausa entre lotes
            if ($index < count($batches) - 1) {
                sleep(2);
            }
        }

        $this->info("✅ Jobs despachados com sucesso! Verifique a fila para acompanhar o progresso.");
    }
}
