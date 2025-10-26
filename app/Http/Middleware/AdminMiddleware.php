<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Acesso negado. Apenas administradores.'], 403);
        }

        return $next($request);
    }
}
