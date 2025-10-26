<?php

namespace App\Console\Commands;

use App\Services\FriendshipService;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class CleanupFriendshipData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'friendships:cleanup {--days=30 : Number of days to keep old data}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old friendship requests and notifications';

    protected FriendshipService $friendshipService;
    protected NotificationService $notificationService;

    /**
     * Create a new command instance.
     */
    public function __construct(FriendshipService $friendshipService, NotificationService $notificationService)
    {
        parent::__construct();
        $this->friendshipService = $friendshipService;
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        
        $this->info("Iniciando limpeza de dados de amizade com mais de {$days} dias...");

        // Limpar solicitações antigas
        $removedRequests = $this->friendshipService->cleanupOldRequests($days);
        $this->info("Removidas {$removedRequests} solicitações de amizade antigas");

        // Limpar notificações antigas
        $removedNotifications = $this->notificationService->cleanupOldNotifications($days);
        $this->info("Removidas {$removedNotifications} notificações antigas");

        $total = $removedRequests + $removedNotifications;
        $this->info("Limpeza concluída! Total de registros removidos: {$total}");

        return Command::SUCCESS;
    }
}
