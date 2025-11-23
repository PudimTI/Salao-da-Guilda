<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('📝 [RequestLogger] Início', [
            'method' => $request->method(),
            'path' => $request->path(),
            'has_authorization_header' => $request->headers->has('Authorization'),
            'has_auth_cookie' => $request->cookies->has('auth_token'),
        ]);

        $response = $next($request);

        Log::info('📝 [RequestLogger] Fim', [
            'status' => $response->getStatusCode(),
            'auth' => auth()->check(),
            'user_id' => auth()->id(),
            'is_redirect' => method_exists($response, 'isRedirection') ? $response->isRedirection() : null,
            'redirect_to' => method_exists($response, 'headers') ? $response->headers->get('Location') : null,
        ]);

        return $response;
    }
}



















