<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rota de teste simples
Route::get('/test-friendship', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Rota de teste funcionando'
    ]);
});

// Rota de friendship sem autenticação
Route::get('/friendships', function (Request $request) {
    return response()->json([
        'success' => true,
        'data' => [],
        'message' => 'Rota de friendship funcionando'
    ]);
});

// Rotas de solicitações de amizade sem autenticação
Route::get('/friendships/requests/received', function (Request $request) {
    return response()->json([
        'success' => true,
        'data' => [],
        'message' => 'Solicitações recebidas funcionando'
    ]);
});

Route::get('/friendships/requests/sent', function (Request $request) {
    return response()->json([
        'success' => true,
        'data' => [],
        'message' => 'Solicitações enviadas funcionando'
    ]);
});

// Rotas de notificações sem autenticação
Route::get('/notifications', function (Request $request) {
    return response()->json([
        'success' => true,
        'data' => [],
        'message' => 'Notificações funcionando'
    ]);
});

Route::get('/notifications/unread-count', function (Request $request) {
    return response()->json([
        'success' => true,
        'count' => 0,
        'message' => 'Contagem de não lidas funcionando'
    ]);
});

// Rota de busca de usuários sem autenticação
Route::get('/users/search', function (Request $request) {
    $query = $request->get('query', '');
    
    if (strlen($query) < 2) {
        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Query muito curta'
        ]);
    }
    
    try {
        $users = \App\Models\User::where('display_name', 'like', "%{$query}%")
            ->orWhere('handle', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->select('id', 'display_name as name', 'handle as username', 'email', 'avatar_url as avatar', 'bio', 'status', 'last_login_at as last_seen')
            ->limit(10)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $users,
            'message' => 'Busca realizada com sucesso'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erro na busca: ' . $e->getMessage()
        ], 500);
    }
});
