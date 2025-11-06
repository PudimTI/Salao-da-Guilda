<?php

namespace App\Filament\Widgets;

use App\Models\Character;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CharactersStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $totalCharacters = Character::count();
        $avgLevel = Character::avg('level') ?? 0;
        $newCharactersThisMonth = Character::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $charactersInCampaigns = Character::whereHas('campaigns')->count();

        return [
            Stat::make('Total de Personagens', $totalCharacters)
                ->description('Personagens cadastrados')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('primary'),
            
            Stat::make('Nível Médio', number_format($avgLevel, 1))
                ->description('Média de níveis')
                ->descriptionIcon('heroicon-m-star')
                ->color('success'),
            
            Stat::make('Em Campanhas', $charactersInCampaigns)
                ->description('Personagens ativos')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('info'),
            
            Stat::make('Novos este Mês', $newCharactersThisMonth)
                ->description('Criados este mês')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),
        ];
    }
}
