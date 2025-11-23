<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NotificationController;

// Rotas públicas
Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/feed', function () {
    return view('feed');
})->name('feed');

Route::get('/campanhas', [CampaignController::class, 'index'])->name('campaigns');

Route::get('/encontrar', function () {
    return view('campaigns.find-react');
})->name('find');

Route::get('/convites', function () {
    return view('invites');
})->name('invites');

Route::get('/test', function () {
    return view('test');
})->name('test');

// Rotas de Amizades
Route::get('/amigos', function () {
    return view('friends-new');
})->name('friends');

Route::get('/solicitacoes', function () {
    return view('friend-requests');
})->name('friend-requests');

Route::get('/notificacoes', function () {
    return view('notifications');
})->name('notifications');

Route::get('/exemplo-friendship', function () {
    return view('friendship-example');
})->name('friendship-example');

Route::get('/chat', function () {
    return view('chat-dm');
})->name('chat-dm');

Route::get('/pusher-test', function () {
    return view('pusher-test');
})->name('pusher-test')->middleware(['inject.bearer', 'auth:sanctum']);

// Rota de teste para upload (sem CSRF)
Route::post('/test-upload', function (Illuminate\Http\Request $request) {
    if ($request->hasFile('media')) {
        $files = $request->file('media');
        $results = [];
        
        if (is_array($files)) {
            foreach ($files as $index => $file) {
                $results[] = [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType(),
                ];
            }
        } else {
            $results[] = [
                'name' => $files->getClientOriginalName(),
                'size' => $files->getSize(),
                'mime' => $files->getMimeType(),
            ];
        }
        
        return response()->json([
            'message' => 'Upload testado com sucesso',
            'files' => $results,
            'count' => count($results)
        ]);
    }
    
    return response()->json(['message' => 'Nenhum arquivo enviado'], 400);
});

// Rota de teste para API de posts (sem CSRF)
Route::post('/test-api-posts', function (Illuminate\Http\Request $request) {
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

Route::get('/welcome', function () {
    return view('welcome');
})->name('welcome');

// Rotas de páginas estáticas do Footer
Route::get('/sobre', function () {
    return view('static.about');
})->name('about');

Route::get('/contato', function () {
    return view('static.contact');
})->name('contact');

Route::get('/termos', function () {
    return view('static.terms');
})->name('terms');

Route::get('/privacidade', function () {
    return view('static.privacy');
})->name('privacy');

// Rota de teste sem CSRF
Route::post('/test-no-csrf', function (Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Rota sem CSRF funcionando',
        'data' => $request->all()
    ]);
});

// Rotas de autenticação
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    
    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
    
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPasswordForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
    
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');
});

// Rotas de API protegidas - aceitam tokens Sanctum
Route::middleware(['auth:sanctum'])->group(function () {
    // Rotas de perfil
    Route::prefix('api/profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('api.profile.show');
        Route::put('/', [ProfileController::class, 'update'])->name('api.profile.update');
        Route::get('/characters', [ProfileController::class, 'characters'])->name('api.profile.characters');
        Route::get('/posts', [ProfileController::class, 'posts'])->name('api.profile.posts');
        Route::get('/campaigns', [ProfileController::class, 'campaigns'])->name('api.profile.campaigns');
        Route::put('/preferences', [ProfileController::class, 'updatePreferences'])->name('api.profile.preferences');
        Route::put('/filters', [ProfileController::class, 'updateFilters'])->name('api.profile.filters');
    });
    
    // Rotas de campanhas API
    Route::prefix('api/campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'apiIndex'])->name('api.campaigns.index');
        Route::get('/public', [CampaignController::class, 'apiPublic'])->name('api.campaigns.public');
        Route::get('/{campaign}', [CampaignController::class, 'apiShow'])->name('api.campaigns.show');
        Route::post('/', [CampaignController::class, 'apiStore'])->name('api.campaigns.store');
        Route::put('/{campaign}', [CampaignController::class, 'apiUpdate'])->name('api.campaigns.update');
        Route::delete('/{campaign}', [CampaignController::class, 'apiDestroy'])->name('api.campaigns.destroy');
        Route::post('/{campaign}/invite', [CampaignController::class, 'apiInvite'])->name('api.campaigns.invite');
        Route::post('/{campaign}/leave', [CampaignController::class, 'apiLeave'])->name('api.campaigns.leave');
        Route::patch('/{campaign}/members/{user}/role', [CampaignController::class, 'apiUpdateMemberRole'])->name('api.campaigns.update-member-role');
        Route::delete('/{campaign}/members/{user}', [CampaignController::class, 'apiRemoveMember'])->name('api.campaigns.remove-member');
    });
    
    // Rotas de notificações
    Route::prefix('api/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('api.notifications.index');
        Route::post('/mark-as-read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-as-read');
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('api.notifications.unread-count');
    });
    
    // Rotas de posts
    Route::prefix('api/posts')->middleware('log.validation')->group(function () {
        Route::get('/', [PostController::class, 'index'])->name('api.posts.index');
        Route::post('/', [PostController::class, 'store'])->name('api.posts.store');
        Route::get('/{post}', [PostController::class, 'show'])->name('api.posts.show');
        Route::put('/{post}', [PostController::class, 'update'])->name('api.posts.update');
        Route::delete('/{post}', [PostController::class, 'destroy'])->name('api.posts.destroy');
        Route::post('/{post}/like', [PostController::class, 'like'])->name('api.posts.like');
        Route::post('/{post}/repost', [PostController::class, 'repost'])->name('api.posts.repost');
        Route::post('/{post}/comment', [PostController::class, 'comment'])->name('api.posts.comment');
        Route::get('/search', [PostController::class, 'search'])->name('api.posts.search');
    });

    // Rotas de mídia
    Route::prefix('api/media')->middleware('log.validation')->group(function () {
        Route::post('/upload', [MediaController::class, 'upload'])->name('api.media.upload');
        Route::get('/', [MediaController::class, 'index'])->name('api.media.index');
        Route::delete('/{media}', [MediaController::class, 'destroy'])->name('api.media.destroy');
        Route::get('/{media}/url', [MediaController::class, 'url'])->name('api.media.url');
    });
});

// Rotas protegidas (aceitam sessão web e tokens Sanctum). O middleware 'inject.bearer'
// permite autenticação por Bearer Token armazenado em cookie 'auth_token' em navegação full-page
Route::middleware(['inject.bearer', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    
    Route::get('/perfil', function () {
        return view('profile');
    })->name('profile');
    
    Route::get('/configuracoes', function () {
        return view('configuracoes');
    })->name('configuracoes');
    
    Route::get('/campanha', function () {
        return view('campaign-react');
    })->name('campaign');
    
    Route::get('/personagem', function () {
        return view('personagem-react');
    })->name('personagem');
    
    // Rotas de campanhas
    Route::resource('campaigns', CampaignController::class);
    
    // Rotas de convites (temporariamente aqui para teste)
    Route::post('/campaigns/{campaign}/invites/request-with-character', [App\Http\Controllers\CampaignInviteController::class, 'requestWithCharacter']);
    Route::get('/campaigns/{campaign}/invites', [App\Http\Controllers\CampaignInviteController::class, 'sentInvites']);
    Route::post('/campaigns/{campaign}/invites/invite-user', [App\Http\Controllers\CampaignInviteController::class, 'inviteUser']);
    Route::post('/campaigns/{campaign}/invites/{invite}/approve', [App\Http\Controllers\CampaignInviteController::class, 'approveRequest']);
    Route::post('/campaigns/{campaign}/invites/{invite}/reject-request', [App\Http\Controllers\CampaignInviteController::class, 'rejectRequest']);
    
    // Rotas de convites individuais
    Route::get('/invites', [App\Http\Controllers\CampaignInviteController::class, 'index']);
    Route::post('/invites/{invite}/accept', [App\Http\Controllers\CampaignInviteController::class, 'accept']);
    Route::post('/invites/{invite}/reject', [App\Http\Controllers\CampaignInviteController::class, 'reject']);
    Route::delete('/invites/{invite}/cancel', [App\Http\Controllers\CampaignInviteController::class, 'cancel']);
    Route::post('/campaigns/{campaign}/invite', [CampaignController::class, 'invite'])->name('campaigns.invite');
    Route::post('/campaigns/{campaign}/accept-invite', [CampaignController::class, 'acceptInvite'])->name('campaigns.accept-invite');
    Route::post('/campaigns/{campaign}/reject-invite', [CampaignController::class, 'rejectInvite'])->name('campaigns.reject-invite');
    Route::delete('/campaigns/{campaign}/members/{user}', [CampaignController::class, 'removeMember'])->name('campaigns.remove-member');
    Route::post('/campaigns/{campaign}/leave', [CampaignController::class, 'leave'])->name('campaigns.leave');
    Route::patch('/campaigns/{campaign}/members/{user}/role', [CampaignController::class, 'updateMemberRole'])->name('campaigns.update-member-role');
    
    // Rota para chat da campanha
    Route::get('/campaigns/{campaign}/chat', function ($campaignId) {
        $campaign = \App\Models\Campaign::findOrFail($campaignId);
        return view('campaign-chat', compact('campaign'));
    })->name('campaigns.chat');
    
    // Rota para mapa mental da campanha
    Route::get('/campaigns/{campaign}/mindmap', function ($campaignId) {
        $campaign = \App\Models\Campaign::findOrFail($campaignId);
        return view('campaign-mindmap', compact('campaign'));
    })->name('campaigns.mindmap');
    
    // Rotas de personagens
    Route::resource('characters', CharacterController::class);
    Route::post('/characters/{character}/join-campaign', [CharacterController::class, 'joinCampaign'])->name('characters.join-campaign');
    Route::delete('/characters/{character}/campaigns/{campaign}', [CharacterController::class, 'leaveCampaign'])->name('characters.leave-campaign');
    
    // Rotas de API para componentes React (usando sessão)
    Route::prefix('api/characters')->group(function () {
        Route::get('/', [CharacterController::class, 'apiIndex'])->name('api.characters.index');
        Route::get('/{character}', [CharacterController::class, 'apiShow'])->name('api.characters.show');
        Route::post('/', [CharacterController::class, 'apiStore'])->name('api.characters.store');
        Route::put('/{character}', [CharacterController::class, 'apiUpdate'])->name('api.characters.update');
        Route::delete('/{character}', [CharacterController::class, 'apiDestroy'])->name('api.characters.destroy');
        Route::post('/{character}/join-campaign', [CharacterController::class, 'apiJoinCampaign'])->name('api.characters.join-campaign');
        Route::delete('/{character}/campaigns/{campaign}', [CharacterController::class, 'apiLeaveCampaign'])->name('api.characters.leave-campaign');
    });
});

// Rota de autenticação do broadcasting (aceita tokens Sanctum)
Broadcast::routes(['middleware' => ['inject.bearer', 'auth:sanctum']]);

// Rotas Admin para Mindmap (aceitam sessão web e tokens Sanctum)
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/mindmap', [App\Http\Controllers\Admin\MindmapController::class, 'index'])->name('admin.mindmap.index');
    Route::get('/mindmap/{campaign}', [App\Http\Controllers\Admin\MindmapController::class, 'show'])->name('admin.mindmap.show');
    Route::get('/mindmap/{campaign}/data', [App\Http\Controllers\Admin\MindmapController::class, 'getMindmapData'])->name('admin.mindmap.data');
    Route::get('/mindmap/stats', [App\Http\Controllers\Admin\MindmapController::class, 'stats'])->name('admin.mindmap.stats');
    Route::get('/mindmap/export', [App\Http\Controllers\Admin\MindmapController::class, 'exportAll'])->name('admin.mindmap.export');
    Route::get('/mindmap/{campaign}/export', [App\Http\Controllers\Admin\MindmapController::class, 'exportCampaign'])->name('admin.mindmap.export.campaign');
    Route::delete('/mindmap/{campaign}/nodes/{node}', [App\Http\Controllers\Admin\MindmapController::class, 'deleteNode'])->name('admin.mindmap.delete.node');
    Route::delete('/mindmap/{campaign}/edges/{edge}', [App\Http\Controllers\Admin\MindmapController::class, 'deleteEdge'])->name('admin.mindmap.delete.edge');
});
