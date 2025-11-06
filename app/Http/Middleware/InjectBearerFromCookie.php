<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectBearerFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->headers->has('Authorization')) {
            return $next($request);
        }

        // Read token from a cookie if present (set this cookie on login from frontend)
        $token = $request->cookie('auth_token');

        if (is_string($token) && trim($token) !== '') {
            // Decodificar caso o cookie venha URL-encoded (ex.: 21%7Cabc...)
            $decoded = urldecode($token);
            $cleanToken = trim($decoded);
            // Evitar duplicar prefixo caso esteja presente
            if (str_starts_with($cleanToken, 'Bearer ')) {
                $cleanToken = substr($cleanToken, 7);
            }
            // Inject header so Sanctum can authenticate via personal access token
            $request->headers->set('Authorization', 'Bearer ' . $cleanToken);
        }

        return $next($request);
    }
}


