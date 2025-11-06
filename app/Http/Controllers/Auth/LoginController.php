<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login-react');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            
            // Atualizar último login
            $user->update(['last_login_at' => now()]);

            // Se a requisição espera JSON (API), retornar token
            if ($request->wantsJson() || $request->expectsJson() || $request->is('api/*')) {
                $token = $user->createToken('auth-token')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'token' => $token,
                    'token_preview' => substr($token, 0, 20) . '...',
                    'token_length' => strlen($token),
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'display_name' => $user->display_name,
                        'handle' => $user->handle,
                    ],
                    'message' => 'Login realizado com sucesso'
                ])
                // Gravar cookie para navegação full-page autenticar via middleware
                ->cookie(
                    'auth_token',
                    $token,
                    60 * 24 * 30,
                    '/',
                    null,
                    app()->environment('production'),
                    true,
                    false,
                    'Lax'
                );
            }

            // Se for requisição web tradicional, redirecionar
            return redirect()->intended('/');
        }

        // Se a requisição espera JSON, retornar erro JSON
        if ($request->wantsJson() || $request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas',
                'errors' => [
                    'email' => [__('auth.failed')]
                ]
            ], 401);
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    public function logout(Request $request)
    {
        // Revogar tokens Sanctum e limpar sessões/remember tokens
        if ($request->user()) {
            // Revogar token atual (se existir) e todos os demais tokens
            if (method_exists($request->user(), 'currentAccessToken') && $request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            }
            if (method_exists($request->user(), 'tokens')) {
                $request->user()->tokens()->delete();
            }

            // Limpar remember_token e destruir sessões persistentes no banco (se driver database)
            $request->user()->forceFill(['remember_token' => null])->save();
            try {
                DB::table('sessions')->where('user_id', $request->user()->id)->delete();
            } catch (\Throwable $e) {
                // Ignorar se não estiver usando driver database
            }
        }

        // Efetuar logout de sessão web, se existir (forçar guard web)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Responder adequadamente conforme o tipo de requisição
        if ($request->wantsJson() || $request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ]);
        }

        return redirect('/');
    }
}
