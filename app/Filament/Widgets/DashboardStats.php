<?php

namespace App\Filament\Widgets;

use App\Models\Campaign;
use App\Models\Character;
use App\Models\Report;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStats extends StatsOverviewWidget
{
    protected static bool $isDiscovered = false;

    protected function getColumns(): array|int|null
    {
        return 4;
    }

    protected function getStats(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $adminsCount = User::where('role', 'admin')->count();
        $suspendedUsers = User::where('status', 'suspended')->count();
        $bannedUsers = User::where('status', 'banned')->count();

        $totalCampaigns = Campaign::count();
        $activeCampaigns = Campaign::where('status', 'active')->count();
        $publicCampaigns = Campaign::where('visibility', 'public')->count();
        $newCampaignsThisMonth = Campaign::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalCharacters = Character::count();
        $avgLevel = Character::avg('level') ?? 0;
        $charactersInCampaigns = Character::whereHas('campaigns')->count();
        $newCharactersThisMonth = Character::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $openReports = Report::where('status', Report::STATUS_OPEN)->count();

        return [
            // Usuários
            Stat::make('Usuários Totais', $totalUsers)
                ->description('Cadastrados no sistema')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Usuários Ativos', $activeUsers)
                ->description('Contas com status ativo')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),

            Stat::make('Usuários Suspensos', $suspendedUsers)
                ->description('Contas temporariamente suspensas')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('warning'),

            Stat::make('Usuários Banidos', $bannedUsers)
                ->description('Contas banidas')
                ->descriptionIcon('heroicon-m-no-symbol')
                ->color('danger'),

            Stat::make('Novos Usuários (mês)', $newUsersThisMonth)
                ->description('Cadastros recentes')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('info'),

            Stat::make('Administradores', $adminsCount)
                ->description('Usuários com privilégios')
                ->descriptionIcon('heroicon-m-shield-check')
                ->color('warning'),

            // Campanhas
            Stat::make('Campanhas Totais', $totalCampaigns)
                ->description('Campanhas registradas')
                ->descriptionIcon('heroicon-m-map')
                ->color('primary'),

            Stat::make('Campanhas Ativas', $activeCampaigns)
                ->description('Em andamento')
                ->descriptionIcon('heroicon-m-play-circle')
                ->color('success'),

            Stat::make('Campanhas Públicas', $publicCampaigns)
                ->description('Visibilidade pública')
                ->descriptionIcon('heroicon-m-globe-alt')
                ->color('info'),

            Stat::make('Novas Campanhas (mês)', $newCampaignsThisMonth)
                ->description('Criadas recentemente')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),

            // Personagens
            Stat::make('Personagens Totais', $totalCharacters)
                ->description('Personagens cadastrados')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('primary'),

            Stat::make('Personagens em Campanhas', $charactersInCampaigns)
                ->description('Participando de campanhas')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),

            Stat::make('Nível Médio', number_format($avgLevel, 1))
                ->description('Média global de níveis')
                ->descriptionIcon('heroicon-m-star')
                ->color('info'),

            Stat::make('Novos Personagens (mês)', $newCharactersThisMonth)
                ->description('Criados recentemente')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),

            // Moderação
            Stat::make('Denúncias Abertas', $openReports)
                ->description('Aguardando análise')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('danger'),
        ];
    }
}

