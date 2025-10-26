<?php

namespace App\Services;

use App\Models\Tag;
use App\Models\Campaign;
use App\Models\Post;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TagService
{
    /**
     * Buscar tags com autocomplete
     */
    public function autocomplete(string $query, string $type = null, int $limit = 10): Collection
    {
        $queryBuilder = Tag::query()
            ->select(['id', 'name', 'type', 'usage_count'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'ilike', "%{$query}%")
                  ->orWhereJsonContains('synonyms', $query);
            });

        if ($type) {
            $queryBuilder->where('type', $type);
        }

        return $queryBuilder
            ->orderBy('usage_count', 'desc')
            ->orderBy('name', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Criar ou encontrar tag
     */
    public function createOrFind(string $name, string $type = null, array $synonyms = []): Tag
    {
        $tag = Tag::where('name', $name)->first();

        if (!$tag) {
            $tag = Tag::create([
                'name' => $name,
                'type' => $type,
                'synonyms' => $synonyms,
                'usage_count' => 0,
                'is_moderated' => false,
            ]);
        }

        return $tag;
    }

    /**
     * Associar tags a um post
     */
    public function attachToPost(Post $post, array $tagIds): void
    {
        $existingTags = $post->tags()->pluck('tags.id')->toArray();
        $newTags = array_diff($tagIds, $existingTags);
        $removedTags = array_diff($existingTags, $tagIds);

        // Adicionar novas tags
        if (!empty($newTags)) {
            $post->tags()->attach($newTags);
            Tag::whereIn('id', $newTags)->increment('usage_count');
        }

        // Remover tags desassociadas
        if (!empty($removedTags)) {
            $post->tags()->detach($removedTags);
            Tag::whereIn('id', $removedTags)->decrement('usage_count');
        }
    }

    /**
     * Associar tags a uma campanha
     */
    public function attachToCampaign(Campaign $campaign, array $tagIds): void
    {
        $existingTags = $campaign->tags()->pluck('tags.id')->toArray();
        $newTags = array_diff($tagIds, $existingTags);
        $removedTags = array_diff($existingTags, $tagIds);

        // Adicionar novas tags
        if (!empty($newTags)) {
            $campaign->tags()->attach($newTags);
            Tag::whereIn('id', $newTags)->increment('usage_count');
        }

        // Remover tags desassociadas
        if (!empty($removedTags)) {
            $campaign->tags()->detach($removedTags);
            Tag::whereIn('id', $removedTags)->decrement('usage_count');
        }
    }

    /**
     * Merge tags (administrativo)
     */
    public function mergeTags(array $sourceTagIds, int $targetTagId): Tag
    {
        return DB::transaction(function () use ($sourceTagIds, $targetTagId) {
            $targetTag = Tag::findOrFail($targetTagId);

            foreach ($sourceTagIds as $sourceTagId) {
                if ($sourceTagId == $targetTagId) {
                    continue; // Pular se for a mesma tag
                }

                $sourceTag = Tag::findOrFail($sourceTagId);

                // Mover relacionamentos de posts
                $this->movePostRelationships($sourceTag, $targetTag);

                // Mover relacionamentos de campanhas
                $this->moveCampaignRelationships($sourceTag, $targetTag);

                // Combinar sinônimos
                $this->combineSynonyms($sourceTag, $targetTag);

                // Atualizar contador de uso
                $targetTag->increment('usage_count', $sourceTag->usage_count);

                // Deletar tag fonte
                $sourceTag->delete();
            }

            return $targetTag->fresh();
        });
    }

    /**
     * Mover relacionamentos de posts
     */
    private function movePostRelationships(Tag $sourceTag, Tag $targetTag): void
    {
        $sourcePostIds = $sourceTag->posts()->pluck('posts.id');

        foreach ($sourcePostIds as $postId) {
            // Verificar se o post já tem a tag alvo
            $hasTargetTag = DB::table('post_tags')
                ->where('post_id', $postId)
                ->where('tag_id', $targetTag->id)
                ->exists();

            if (!$hasTargetTag) {
                // Adicionar tag alvo
                DB::table('post_tags')
                    ->insert([
                        'post_id' => $postId,
                        'tag_id' => $targetTag->id,
                        'created_at' => now(),
                    ]);
            }

            // Remover tag fonte
            DB::table('post_tags')
                ->where('post_id', $postId)
                ->where('tag_id', $sourceTag->id)
                ->delete();
        }
    }

    /**
     * Mover relacionamentos de campanhas
     */
    private function moveCampaignRelationships(Tag $sourceTag, Tag $targetTag): void
    {
        $sourceCampaignIds = $sourceTag->campaigns()->pluck('campaigns.id');

        foreach ($sourceCampaignIds as $campaignId) {
            // Verificar se a campanha já tem a tag alvo
            $hasTargetTag = DB::table('campaign_tags')
                ->where('campaign_id', $campaignId)
                ->where('tag_id', $targetTag->id)
                ->exists();

            if (!$hasTargetTag) {
                // Adicionar tag alvo
                DB::table('campaign_tags')
                    ->insert([
                        'campaign_id' => $campaignId,
                        'tag_id' => $targetTag->id,
                        'created_at' => now(),
                    ]);
            }

            // Remover tag fonte
            DB::table('campaign_tags')
                ->where('campaign_id', $campaignId)
                ->where('tag_id', $sourceTag->id)
                ->delete();
        }
    }

    /**
     * Combinar sinônimos
     */
    private function combineSynonyms(Tag $sourceTag, Tag $targetTag): void
    {
        $sourceSynonyms = $sourceTag->synonyms ?? [];
        $targetSynonyms = $targetTag->synonyms ?? [];

        // Adicionar nome da tag fonte como sinônimo
        $sourceSynonyms[] = $sourceTag->name;

        // Combinar sinônimos únicos
        $combinedSynonyms = array_unique(array_merge($targetSynonyms, $sourceSynonyms));

        $targetTag->update(['synonyms' => array_values($combinedSynonyms)]);
    }

    /**
     * Importar tags em lote
     */
    public function bulkImport(array $tagsData): Collection
    {
        $createdTags = collect();

        foreach ($tagsData as $tagData) {
            $tag = $this->createOrFind(
                $tagData['name'],
                $tagData['type'] ?? null,
                $tagData['synonyms'] ?? []
            );

            if (isset($tagData['description'])) {
                $tag->update(['description' => $tagData['description']]);
            }

            $createdTags->push($tag);
        }

        return $createdTags;
    }

    /**
     * Buscar tags populares
     */
    public function getPopularTags(int $limit = 20, string $type = null): Collection
    {
        $query = Tag::query()
            ->select(['id', 'name', 'type', 'usage_count'])
            ->orderBy('usage_count', 'desc')
            ->orderBy('name', 'asc')
            ->limit($limit);

        if ($type) {
            $query->where('type', $type);
        }

        return $query->get();
    }

    /**
     * Buscar tags por usuário (baseado nos filtros)
     */
    public function getTagsForUser(int $userId, string $type = null): Collection
    {
        $userFilter = \App\Models\UserFilter::where('user_id', $userId)->first();

        $query = Tag::query()
            ->select(['id', 'name', 'type', 'usage_count']);

        if ($userFilter) {
            // Aplicar whitelist
            if (!empty($userFilter->whitelist_tags)) {
                $query->whereIn('id', $userFilter->whitelist_tags);
            }

            // Aplicar blacklist
            if (!empty($userFilter->blacklist_tags)) {
                $query->whereNotIn('id', $userFilter->blacklist_tags);
            }
        }

        if ($type) {
            $query->where('type', $type);
        }

        return $query
            ->orderBy('usage_count', 'desc')
            ->orderBy('name', 'asc')
            ->get();
    }
}
