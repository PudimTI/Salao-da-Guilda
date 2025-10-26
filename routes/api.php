<?php

use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\DiceRollController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\MindmapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Rota de login para gerar token
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);
    
    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }
    
    return response()->json([
        'success' => false,
        'message' => 'Credenciais inválidas'
    ], 401);
});

// Rota de teste para API sem CSRF
Route::post('/test-posts', function (Request $request) {
    try {
        $post = \App\Models\Post::create([
            'author_id' => 1, // Usuário fixo para teste
            'content' => $request->get('content', 'Teste de post'),
            'visibility' => $request->get('visibility', 'public'),
        ]);

        if ($request->hasFile('media')) {
            $files = $request->file('media');
            if (is_array($files)) {
                foreach ($files as $file) {
                    $post->addMedia($file)->toMediaCollection('attachments');
                }
            } else {
                $post->addMedia($files)->toMediaCollection('attachments');
            }
        }

        return response()->json([
            'message' => 'Post criado com sucesso',
            'post' => new \App\Http\Resources\PostResource($post)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erro ao criar post',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Rotas de teste para friendship (sem autenticação temporariamente)
Route::get('/friendships', function (Request $request) {
    return response()->json([
        'success' => true,
        'data' => [],
        'message' => 'Rota de friendship funcionando'
    ]);
});

Route::get('/users/search', function (Request $request) {
    $query = $request->get('query', '');
    
    if (strlen($query) < 2) {
        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Query muito curta'
        ]);
    }
    
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
});

// Rotas de Amizade - Requerem autenticação
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Busca de usuários
    Route::get('/users/search', function (Request $request) {
        $query = $request->get('query', '');
        $perPage = $request->get('per_page', 15);
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Query muito curta'
            ]);
        }
        
        $users = \App\Models\User::where('display_name', 'like', "%{$query}%")
            ->orWhere('handle', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->select('id', 'display_name as name', 'handle as username', 'email', 'avatar_url as avatar', 'bio', 'status', 'last_login_at as last_seen')
            ->paginate($perPage);
            
        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total()
            ]
        ]);
    });
    
    // Gerenciar amizades
    Route::prefix('friendships')->group(function () {
        // Listar amigos
        Route::get('/', [FriendshipController::class, 'index']);
        
        // Enviar solicitação de amizade
        Route::post('/send-request', [FriendshipController::class, 'sendRequest']);
        
        // Responder solicitação de amizade
        Route::post('/respond-request', [FriendshipController::class, 'respondRequest']);
        
        // Cancelar solicitação enviada
        Route::post('/cancel-request', [FriendshipController::class, 'cancelRequest']);
        
        // Remover amizade
        Route::post('/remove', [FriendshipController::class, 'removeFriendship']);
        
        // Bloquear usuário
        Route::post('/block', [FriendshipController::class, 'blockUser']);
        
        // Desbloquear usuário
        Route::post('/unblock', [FriendshipController::class, 'unblockUser']);
        
        // Listar solicitações recebidas
        Route::get('/requests/received', [FriendshipController::class, 'getReceivedRequests']);
        
        // Listar solicitações enviadas
        Route::get('/requests/sent', [FriendshipController::class, 'getSentRequests']);
        
        // Verificar status de relacionamento
        Route::get('/relationship-status', [FriendshipController::class, 'getRelationshipStatus']);
    });
    
    // Gerenciar notificações
    Route::prefix('notifications')->group(function () {
        // Listar notificações
        Route::get('/', [NotificationController::class, 'index']);
        
        // Marcar como lidas
        Route::post('/mark-read', [NotificationController::class, 'markAsRead']);
        
        // Contagem de não lidas
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
    });

    // Gerenciar tags
    Route::prefix('tags')->group(function () {
        // CRUD básico de tags
        Route::get('/', [TagController::class, 'index']);
        Route::get('/popular', [TagController::class, 'popular']);
        Route::get('/for-user', [TagController::class, 'forUser']);
        Route::get('/{tag}', [TagController::class, 'show']);
        Route::post('/', [TagController::class, 'store']);
        Route::put('/{tag}', [TagController::class, 'update']);
        Route::delete('/{tag}', [TagController::class, 'destroy']);
        
        // Autocomplete
        Route::get('/autocomplete', [TagController::class, 'autocomplete']);
        
        // Funcionalidades administrativas
        Route::middleware(['admin'])->group(function () {
            Route::post('/merge', [TagController::class, 'merge']);
            Route::post('/bulk-import', [TagController::class, 'bulkImport']);
            Route::post('/{tag}/moderate', [TagController::class, 'moderate']);
        });
    });

    // Gerenciar recomendações
    Route::prefix('recommendations')->group(function () {
        // Listar recomendações do usuário
        Route::get('/', [RecommendationController::class, 'index']);
        
        // Gerar novas recomendações
        Route::post('/generate', [RecommendationController::class, 'generate']);
        
        // Marcar recomendação como visualizada
        Route::post('/{recommendation}/view', [RecommendationController::class, 'markAsViewed']);
        
        // Obter estatísticas de recomendações
        Route::get('/stats', [RecommendationController::class, 'stats']);
        
        // Limpar cache de recomendações
        Route::delete('/cache', [RecommendationController::class, 'clearCache']);
    });

    // Gerenciar rolagem de dados
    Route::prefix('campaigns/{campaign}')->group(function () {
        Route::get('/dice-rolls', [DiceRollController::class, 'index']);
        Route::post('/dice-rolls', [DiceRollController::class, 'store']);
        Route::get('/dice-rolls/stats', [DiceRollController::class, 'stats']);
        Route::delete('/dice-rolls/{diceRoll}', [DiceRollController::class, 'destroy']);
    });

    // Teste de rota simples
    Route::get('/test-chat', function () {
        return response()->json(['message' => 'Chat routes working']);
    });

    // Teste de controller simples
    Route::get('/test-chat-controller', function () {
        try {
            $chatService = new \App\Services\ChatService();
            return response()->json(['message' => 'ChatService loaded successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Rotas de Chat
    Route::get('/chat/conversations', [ChatController::class, 'index']);
    Route::post('/chat/conversations', [ChatController::class, 'store']);
    Route::get('/chat/conversations/{conversation}', [ChatController::class, 'show']);
    Route::get('/chat/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/chat/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::get('/campaigns/{campaign}/conversations', [ChatController::class, 'getCampaignConversations']);
    Route::get('/campaigns/{campaign}/members', [CampaignController::class, 'getCampaignMembers']);

});

// Sistema de convites (temporariamente sem autenticação para teste)
Route::prefix('invites')->group(function () {
    Route::get('/', [\App\Http\Controllers\CampaignInviteController::class, 'index']);
    Route::post('/{invite}/accept', [\App\Http\Controllers\CampaignInviteController::class, 'accept']);
    Route::post('/{invite}/reject', [\App\Http\Controllers\CampaignInviteController::class, 'reject']);
    Route::delete('/{invite}/cancel', [\App\Http\Controllers\CampaignInviteController::class, 'cancel']);
});

// Convites de campanha (temporariamente sem autenticação para teste)
Route::get('/campaigns/{campaign}/invites', 'App\Http\Controllers\CampaignInviteController@sentInvites');
Route::post('/campaigns/{campaign}/invites/invite-user', 'App\Http\Controllers\CampaignInviteController@inviteUser');
Route::post('/campaigns/{campaign}/invites/request-with-character', 'App\Http\Controllers\CampaignInviteController@requestWithCharacter');
Route::post('/campaigns/{campaign}/invites/{invite}/approve', 'App\Http\Controllers\CampaignInviteController@approveRequest');
Route::post('/campaigns/{campaign}/invites/{invite}/reject-request', 'App\Http\Controllers\CampaignInviteController@rejectRequest');

// Rotas do mapa mental (temporariamente sem autenticação)
Route::get('/campaigns/{campaign}/mindmap', [MindmapController::class, 'index']);
Route::get('/campaigns/{campaign}/mindmap/files', [MindmapController::class, 'availableFiles']);
