<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Like;
use App\Models\Repost;
use App\Models\Comment;
use App\Models\Mention;
use App\Services\TagService;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Requests\LikePostRequest;
use App\Http\Requests\RepostRequest;
use App\Http\Requests\CommentRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostCollection;
use App\Notifications\PostLiked;
use App\Notifications\PostReposted;
use App\Notifications\PostCommented;
use App\Notifications\UserMentioned;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PostController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TagService $tagService
    ) {}
    /**
     * Listar posts do feed
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['author', 'likes', 'comments', 'reposts', 'mentions', 'tags'])
            ->where('visibility', 'public')
            ->orderBy('created_at', 'desc');

        // Filtro por usuário se especificado
        if ($request->has('user_id')) {
            $query->where('author_id', $request->user_id);
        }

        // Busca por conteúdo
        if ($request->has('search')) {
            $query->where('content', 'like', '%' . $request->search . '%');
        }

        // Filtro por tags
        if ($request->has('tags') && is_array($request->tags)) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->whereIn('tags.id', $request->tags);
            });
        }

        $posts = $query->paginate(10);

        return response()->json([
            'posts' => PostCollection::make($posts),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Criar novo post
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        // Log de validação
        Log::info('PostController::store - Validação passou', [
            'validated_data' => $request->validated()
        ]);

        Log::info('PostController::store - Iniciando criação de post', [
            'user_id' => Auth::id(),
            'content_length' => strlen($request->get('content', '')),
            'has_media' => $request->hasFile('media'),
            'media_count' => $request->hasFile('media') ? count($request->file('media')) : 0,
            'request_data' => $request->all(),
            'headers' => $request->headers->all(),
            'files' => $request->allFiles()
        ]);

        DB::beginTransaction();
        
        try {
            $post = Post::create([
                'author_id' => Auth::id(),
                'content' => $request->get('content'),
                'visibility' => $request->get('visibility', 'public'),
                'reply_to_post_id' => $request->get('reply_to_post_id'),
            ]);

            Log::info('PostController::store - Post criado', ['post_id' => $post->id]);

            // Processar mídia se fornecida
            if ($request->hasFile('media')) {
                Log::info('PostController::store - Processando mídia', [
                    'files_count' => count($request->file('media')),
                    'files_info' => array_map(function($file) {
                        return [
                            'name' => $file->getClientOriginalName(),
                            'size' => $file->getSize(),
                            'mime' => $file->getMimeType(),
                            'extension' => $file->getClientOriginalExtension(),
                        ];
                    }, $request->file('media'))
                ]);

                $mediaFiles = $request->file('media');
                if (is_array($mediaFiles)) {
                    foreach ($mediaFiles as $index => $file) {
                        // Verificar se o arquivo é válido
                        if (!$file || !$file->isValid() || $file->getSize() === 0) {
                            Log::warning('PostController::store - Arquivo inválido ignorado', [
                                'index' => $index,
                                'file' => $file ? $file->getClientOriginalName() : 'null',
                                'is_valid' => $file ? $file->isValid() : false,
                                'size' => $file ? $file->getSize() : 0
                            ]);
                            continue;
                        }
                        
                        Log::info('PostController::store - Adicionando arquivo', [
                            'index' => $index,
                            'name' => $file->getClientOriginalName(),
                            'size' => $file->getSize()
                        ]);
                        
                        // Capturar MIME type antes de processar o arquivo
                        $mimeType = $file->getMimeType();
                        
                        $media = $post->addMedia($file)
                            ->usingName($file->getClientOriginalName())
                            ->usingFileName($file->getClientOriginalName())
                            ->toMediaCollection('attachments');
                        
                        // Salvar na tabela post_media
                        PostMedia::create([
                            'post_id' => $post->id,
                            'url' => $media->getUrl(),
                            'type' => $mimeType,
                            'position' => $index
                        ]);
                        
                        Log::info('PostController::store - Mídia adicionada', [
                            'media_id' => $media->id,
                            'url' => $media->getUrl(),
                            'post_media_saved' => true
                        ]);
                    }
                } else {
                    // Verificar se o arquivo único é válido
                    if ($mediaFiles && $mediaFiles->isValid() && $mediaFiles->getSize() > 0) {
                        Log::info('PostController::store - Adicionando arquivo único');
                        // Capturar MIME type antes de processar o arquivo
                        $mimeType = $mediaFiles->getMimeType();
                        
                        $media = $post->addMedia($mediaFiles)
                            ->usingName($mediaFiles->getClientOriginalName())
                            ->usingFileName($mediaFiles->getClientOriginalName())
                            ->toMediaCollection('attachments');
                        
                        // Salvar na tabela post_media
                        PostMedia::create([
                            'post_id' => $post->id,
                            'url' => $media->getUrl(),
                            'type' => $mimeType,
                            'position' => 0
                        ]);
                        
                        Log::info('PostController::store - Mídia única adicionada', [
                            'media_id' => $media->id,
                            'url' => $media->getUrl(),
                            'post_media_saved' => true
                        ]);
                    } else {
                        Log::warning('PostController::store - Arquivo único inválido ignorado', [
                            'file' => $mediaFiles ? $mediaFiles->getClientOriginalName() : 'null',
                            'is_valid' => $mediaFiles ? $mediaFiles->isValid() : false,
                            'size' => $mediaFiles ? $mediaFiles->getSize() : 0
                        ]);
                    }
                }
            } else {
                Log::info('PostController::store - Nenhuma mídia fornecida');
            }

            // Processar menções
            if ($request->has('mentions')) {
                foreach ($request->mentions as $mentionedUserId) {
                    Mention::create([
                        'post_id' => $post->id,
                        'mentioned_user_id' => $mentionedUserId,
                        'author_id' => Auth::id(),
                    ]);
                    
                    // Enviar notificação para usuário mencionado
                    $mentionedUser = \App\Models\User::find($mentionedUserId);
                    if ($mentionedUser && $mentionedUser->id !== Auth::id()) {
                        $mentionedUser->notify(new UserMentioned($post, Auth::user()));
                    }
                }
            }

            // Processar tags
            if ($request->has('tags') && is_array($request->tags)) {
                $this->tagService->attachToPost($post, $request->tags);
            }

            DB::commit();

            Log::info('PostController::store - Post criado com sucesso', [
                'post_id' => $post->id,
                'media_count' => $post->getMedia('attachments')->count()
            ]);

            return response()->json([
                'message' => 'Post criado com sucesso',
                'post' => new PostResource($post->load(['author', 'mentions']))
            ], 201);

        } catch (\Exception $e) {
            Log::error('PostController::store - Erro ao criar post', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir post específico
     */
    public function show(Post $post): JsonResponse
    {
        $post->load(['author', 'likes', 'comments.author', 'reposts', 'mentions.mentionedUser', 'tags']);

        return response()->json([
            'post' => new PostResource($post)
        ]);
    }

    /**
     * Atualizar post
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        DB::beginTransaction();
        
        try {
            $post->update($request->only(['content', 'visibility']));

            // Atualizar mídia se fornecida
            if ($request->hasFile('media')) {
                // Remover mídia antiga
                $post->clearMediaCollection('attachments');
                
                // Adicionar nova mídia
                foreach ($request->file('media') as $file) {
                    $post->addMedia($file)
                        ->toMediaCollection('attachments');
                }
            }

            // Atualizar menções
            if ($request->has('mentions')) {
                $post->mentions()->delete();
                foreach ($request->mentions as $mentionedUserId) {
                    Mention::create([
                        'post_id' => $post->id,
                        'mentioned_user_id' => $mentionedUserId,
                        'author_id' => Auth::id(),
                    ]);
                }
            }

            // Atualizar tags
            if ($request->has('tags')) {
                $this->tagService->attachToPost($post, $request->tags);
            }

            DB::commit();

            return response()->json([
                'message' => 'Post atualizado com sucesso',
                'post' => new PostResource($post->load(['author', 'media', 'mentions']))
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir post
     */
    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        DB::beginTransaction();
        
        try {
            // Remover mídia associada (Media Library faz isso automaticamente)
            $post->delete();

            DB::commit();

            return response()->json([
                'message' => 'Post excluído com sucesso'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao excluir post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Curtir/descurtir post
     */
    public function like(LikePostRequest $request, Post $post): JsonResponse
    {
        $userId = Auth::id();
        $like = $post->likes()->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
            $action = 'unliked';
        } else {
            Like::create([
                'post_id' => $post->id,
                'user_id' => $userId,
            ]);
            $action = 'liked';
            
            // Enviar notificação para o autor do post (se não for o próprio usuário)
            if ($post->author_id !== $userId) {
                $post->author->notify(new PostLiked($post, Auth::user()));
            }
        }

        return response()->json([
            'message' => $action === 'liked' ? 'Post curtido' : 'Curtida removida',
            'liked' => $action === 'liked',
            'likes_count' => $post->likes()->count()
        ]);
    }

    /**
     * Repostar/desrepostar post
     */
    public function repost(RepostRequest $request, Post $post): JsonResponse
    {
        $userId = Auth::id();
        $repost = $post->reposts()->where('user_id', $userId)->first();

        if ($repost) {
            $repost->delete();
            $action = 'unreposted';
        } else {
            Repost::create([
                'post_id' => $post->id,
                'user_id' => $userId,
            ]);
            $action = 'reposted';
            
            // Enviar notificação para o autor do post (se não for o próprio usuário)
            if ($post->author_id !== $userId) {
                $post->author->notify(new PostReposted($post, Auth::user()));
            }
        }

        return response()->json([
            'message' => $action === 'reposted' ? 'Post repostado' : 'Repost removido',
            'reposted' => $action === 'reposted',
            'reposts_count' => $post->reposts()->count()
        ]);
    }

    /**
     * Comentar em post
     */
    public function comment(CommentRequest $request, Post $post): JsonResponse
    {
        $comment = Comment::create([
            'post_id' => $post->id,
            'author_id' => Auth::id(),
            'content' => $request->get('content'),
        ]);

        // Enviar notificação para o autor do post (se não for o próprio usuário)
        if ($post->author_id !== Auth::id()) {
            $post->author->notify(new PostCommented($post, $comment, Auth::user()));
        }

        return response()->json([
            'message' => 'Comentário adicionado',
            'comment' => $comment->load('author')
        ], 201);
    }

    /**
     * Buscar posts
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        
        if (empty($query)) {
            return response()->json(['posts' => []]);
        }

        $posts = Post::search($query)
            ->where('visibility', 'public')
            ->paginate(10);

        return response()->json([
            'posts' => PostCollection::make($posts),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }
}
