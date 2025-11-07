<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\DashboardStats;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationLabel = 'Dashboard';

    protected static ?string $title = 'Salão da Guilda - Dashboard';

    protected static ?string $description = 'Visão geral do sistema e estatísticas';

    protected function getHeaderWidgets(): array
    {
        return [
            DashboardStats::class,
        ];
    }
}
