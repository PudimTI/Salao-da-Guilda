<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogValidationErrors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Log validation errors for API routes
        if ($request->is('api/*') && $response->status() === 422) {
            $files = $request->allFiles();
            $filesInfo = [];
            foreach ($files as $key => $file) {
                if (is_array($file)) {
                    foreach ($file as $index => $f) {
                        if ($f && $f->isValid()) {
                            $filesInfo[$key][$index] = [
                                'name' => $f->getClientOriginalName(),
                                'size' => $f->getSize(),
                                'mime' => $f->getMimeType(),
                            ];
                        } else {
                            $filesInfo[$key][$index] = [
                                'name' => 'invalid_file',
                                'size' => 0,
                                'mime' => 'unknown',
                            ];
                        }
                    }
                } else {
                    if ($file && $file->isValid()) {
                        $filesInfo[$key] = [
                            'name' => $file->getClientOriginalName(),
                            'size' => $file->getSize(),
                            'mime' => $file->getMimeType(),
                        ];
                    } else {
                        $filesInfo[$key] = [
                            'name' => 'invalid_file',
                            'size' => 0,
                            'mime' => 'unknown',
                        ];
                    }
                }
            }
            
            Log::error('Validation Error on API Route', [
                'url' => $request->url(),
                'method' => $request->method(),
                'data' => $request->all(),
                'files' => $filesInfo,
                'headers' => $request->headers->all(),
                'response' => $response->getContent()
            ]);
        }

        return $response;
    }
}
