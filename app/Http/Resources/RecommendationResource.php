<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'score' => round($this->score, 3),
            'reason' => $this->reason,
            'generated_at' => $this->generated_at?->toISOString(),
            'valid_until' => $this->valid_until?->toISOString(),
            'is_valid' => $this->valid_until > now(),
            
            // Dados do target baseado no tipo
            'target' => $this->getTargetData(),
            
            // Metadados adicionais
            'score_percentage' => round($this->score * 100, 1),
            'days_until_expiry' => $this->valid_until ? $this->valid_until->diffInDays(now()) : 0
        ];
    }

    /**
     * Obter dados do target baseado no tipo
     */
    private function getTargetData(): ?array
    {
        if (!$this->target_type || !$this->target_id) {
            return null;
        }

        try {
            switch ($this->target_type) {
                case 'campaign':
                    $campaign = \App\Models\Campaign::with(['owner', 'tags'])->find($this->target_id);
                    if (!$campaign) return null;
                    
                    return [
                        'id' => $campaign->id,
                        'name' => $campaign->name,
                        'description' => $campaign->description,
                        'system' => $campaign->system,
                        'status' => $campaign->status,
                        'visibility' => $campaign->visibility,
                        'owner' => [
                            'id' => $campaign->owner->id,
                            'display_name' => $campaign->owner->display_name,
                            'handle' => $campaign->owner->handle,
                            'avatar_url' => $campaign->owner->avatar_url
                        ],
                        'tags' => $campaign->tags->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'category' => $tag->category
                            ];
                        }),
                        'created_at' => $campaign->created_at?->toISOString(),
                        'updated_at' => $campaign->updated_at?->toISOString()
                    ];

                case 'post':
                    $post = \App\Models\Post::with(['author', 'tags'])->find($this->target_id);
                    if (!$post) return null;
                    
                    return [
                        'id' => $post->id,
                        'content' => $post->content,
                        'visibility' => $post->visibility,
                        'author' => [
                            'id' => $post->author->id,
                            'display_name' => $post->author->display_name,
                            'handle' => $post->author->handle,
                            'avatar_url' => $post->author->avatar_url
                        ],
                        'tags' => $post->tags->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'category' => $tag->category
                            ];
                        }),
                        'likes_count' => $post->likes_count ?? 0,
                        'comments_count' => $post->comments_count ?? 0,
                        'reposts_count' => $post->reposts_count ?? 0,
                        'created_at' => $post->created_at?->toISOString(),
                        'updated_at' => $post->updated_at?->toISOString()
                    ];

                default:
                    return null;
            }
        } catch (\Exception $e) {
            \Log::warning('Erro ao carregar dados do target', [
                'target_type' => $this->target_type,
                'target_id' => $this->target_id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
