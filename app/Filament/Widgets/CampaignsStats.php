<?php

namespace App\Filament\Widgets;

use App\Models\Campaign;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CampaignsStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $totalCampaigns = Campaign::count();
        $activeCampaigns = Campaign::where('status', 'active')->count();
        $publicCampaigns = Campaign::where('visibility', 'public')->count();
        $newCampaignsThisMonth = Campaign::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return [
            Stat::make('Total de Campanhas', $totalCampaigns)
                ->description('Campanhas cadastradas')
                ->descriptionIcon('heroicon-m-map')
                ->color('primary'),
            
            Stat::make('Campanhas Ativas', $activeCampaigns)
                ->description('Com status ativo')
                ->descriptionIcon('heroicon-m-play-circle')
                ->color('success'),
            
            Stat::make('Campanhas Públicas', $publicCampaigns)
                ->description('Visibilidade pública')
                ->descriptionIcon('heroicon-m-globe-alt')
                ->color('info'),
            
            Stat::make('Novas este Mês', $newCampaignsThisMonth)
                ->description('Criadas este mês')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),
        ];
    }
}
