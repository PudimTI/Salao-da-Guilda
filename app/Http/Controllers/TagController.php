<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Services\TagService;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Requests\MergeTagsRequest;
use App\Http\Requests\BulkImportTagsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TagController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TagService $tagService
    ) {}

    /**
     * Listar tags
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tag::query()
            ->select(['id', 'name', 'type', 'description', 'usage_count', 'is_moderated', 'created_at']);

        // Filtros
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('moderated')) {
            $query->where('is_moderated', $request->boolean('moderated'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%")
                  ->orWhereJsonContains('synonyms', $search);
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'usage_count');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['name', 'type', 'usage_count', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $tags = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $tags->items(),
            'pagination' => [
                'current_page' => $tags->currentPage(),
                'last_page' => $tags->lastPage(),
                'per_page' => $tags->perPage(),
                'total' => $tags->total(),
            ],
        ]);
    }

    /**
     * Exibir tag específica
     */
    public function show(Tag $tag): JsonResponse
    {
        $tag->load(['campaigns:id,name', 'posts:id,content,author_id']);

        return response()->json([
            'data' => $tag,
        ]);
    }

    /**
     * Criar nova tag
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        try {
            $tag = Tag::create($request->validated());

            Log::info('Tag criada', [
                'tag_id' => $tag->id,
                'tag_name' => $tag->name,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tag criada com sucesso',
                'data' => $tag,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao criar tag', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao criar tag',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Atualizar tag
     */
    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $this->authorize('update', $tag);

        try {
            $tag->update($request->validated());

            Log::info('Tag atualizada', [
                'tag_id' => $tag->id,
                'tag_name' => $tag->name,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tag atualizada com sucesso',
                'data' => $tag->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao atualizar tag', [
                'tag_id' => $tag->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao atualizar tag',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deletar tag
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $this->authorize('delete', $tag);

        try {
            $tagName = $tag->name;
            $tag->delete();

            Log::info('Tag deletada', [
                'tag_id' => $tag->id,
                'tag_name' => $tagName,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tag deletada com sucesso',
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao deletar tag', [
                'tag_id' => $tag->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao deletar tag',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Autocomplete de tags
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:1|max:100',
            'type' => 'nullable|string|in:post,campaign,general',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $query = $request->get('q');
        $type = $request->get('type');
        $limit = $request->get('limit', 10);

        $tags = $this->tagService->autocomplete($query, $type, $limit);

        return response()->json([
            'data' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'type' => $tag->type,
                    'usage_count' => $tag->usage_count,
                ];
            }),
        ]);
    }

    /**
     * Buscar tags populares
     */
    public function popular(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'nullable|string|in:post,campaign,general',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $type = $request->get('type');
        $limit = $request->get('limit', 20);

        $tags = $this->tagService->getPopularTags($limit, $type);

        return response()->json([
            'data' => $tags,
        ]);
    }

    /**
     * Buscar tags para usuário (baseado nos filtros)
     */
    public function forUser(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'nullable|string|in:post,campaign,general',
        ]);

        $type = $request->get('type');
        $userId = Auth::id();

        $tags = $this->tagService->getTagsForUser($userId, $type);

        return response()->json([
            'data' => $tags,
        ]);
    }

    /**
     * Merge tags (administrativo)
     */
    public function merge(MergeTagsRequest $request): JsonResponse
    {
        try {
            $sourceTagIds = $request->validated()['source_tag_ids'];
            $targetTagId = $request->validated()['target_tag_id'];

            $targetTag = $this->tagService->mergeTags($sourceTagIds, $targetTagId);

            // Registrar ação no audit log se existir
            if (class_exists(\App\Models\AdminAuditLog::class)) {
                \App\Models\AdminAuditLog::create([
                    'admin_id' => Auth::id(),
                    'action' => 'merge_tags',
                    'description' => "Tags merged: " . implode(', ', $sourceTagIds) . " into {$targetTagId}",
                    'metadata' => [
                        'source_tag_ids' => $sourceTagIds,
                        'target_tag_id' => $targetTagId,
                    ],
                ]);
            }

            Log::info('Tags merged', [
                'source_tag_ids' => $sourceTagIds,
                'target_tag_id' => $targetTagId,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tags merged com sucesso',
                'data' => $targetTag,
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao fazer merge de tags', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao fazer merge de tags',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Importar tags em lote (administrativo)
     */
    public function bulkImport(BulkImportTagsRequest $request): JsonResponse
    {
        try {
            $tagsData = $request->validated()['tags'];
            $createdTags = $this->tagService->bulkImport($tagsData);

            // Registrar ação no audit log se existir
            if (class_exists(\App\Models\AdminAuditLog::class)) {
                \App\Models\AdminAuditLog::create([
                    'admin_id' => Auth::id(),
                    'action' => 'bulk_import_tags',
                    'description' => "Bulk import of " . count($tagsData) . " tags",
                    'metadata' => [
                        'tags_count' => count($tagsData),
                        'tag_names' => array_column($tagsData, 'name'),
                    ],
                ]);
            }

            Log::info('Tags importadas em lote', [
                'tags_count' => count($tagsData),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tags importadas com sucesso',
                'data' => $createdTags,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao importar tags em lote', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao importar tags em lote',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Moderar tag (administrativo)
     */
    public function moderate(Request $request, Tag $tag): JsonResponse
    {
        $this->authorize('moderate', $tag);

        $request->validate([
            'is_moderated' => 'required|boolean',
        ]);

        try {
            $tag->update(['is_moderated' => $request->boolean('is_moderated')]);

            // Registrar ação no audit log se existir
            if (class_exists(\App\Models\AdminAuditLog::class)) {
                \App\Models\AdminAuditLog::create([
                    'admin_id' => Auth::id(),
                    'action' => 'moderate_tag',
                    'description' => "Tag moderated: {$tag->name} (is_moderated: {$request->boolean('is_moderated')})",
                    'metadata' => [
                        'tag_id' => $tag->id,
                        'tag_name' => $tag->name,
                        'is_moderated' => $request->boolean('is_moderated'),
                    ],
                ]);
            }

            Log::info('Tag moderada', [
                'tag_id' => $tag->id,
                'tag_name' => $tag->name,
                'is_moderated' => $request->boolean('is_moderated'),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Tag moderada com sucesso',
                'data' => $tag->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao moderar tag', [
                'tag_id' => $tag->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Erro ao moderar tag',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
