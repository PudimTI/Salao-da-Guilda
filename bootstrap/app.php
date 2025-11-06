<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware (executa em todas as requisições)
        // Prepend para garantir que o Bearer seja injetado antes de qualquer auth
        $middleware->prepend([ 
            \App\Http\Middleware\InjectBearerFromCookie::class,
        ]);
        // (logs removidos) $middleware->append([...]);

        $middleware->alias([
            'log.validation' => \App\Http\Middleware\LogValidationErrors::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'inject.bearer' => \App\Http\Middleware\InjectBearerFromCookie::class,
        ]);
        
        // Configurar CSRF para permitir rotas de API
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
