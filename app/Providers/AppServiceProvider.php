<?php

namespace App\Providers;

use App\Models\Character;
use App\Policies\CharacterPolicy;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Character::class, CharacterPolicy::class);
        
        // Registrar rotas de friendship
        Route::prefix('api')->group(base_path('routes/api-friendship.php'));

        Relation::enforceMorphMap(config('reports.targets'));
    }
}
