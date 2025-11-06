<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class UsersStats extends BaseWidget
{
    protected function getStats(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $adminsCount = User::where('role', 'admin')->count();

        return [
            Stat::make('Total de Usuários', $totalUsers)
                ->description('Usuários cadastrados')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
            
            Stat::make('Usuários Ativos', $activeUsers)
                ->description('Com status ativo')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
            
            Stat::make('Novos este Mês', $newUsersThisMonth)
                ->description('Novos cadastros')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('info'),
            
            Stat::make('Administradores', $adminsCount)
                ->description('Usuários admin')
                ->descriptionIcon('heroicon-m-shield-check')
                ->color('warning'),
        ];
    }
}





