<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'reason_text' => $this->reason_text,
            'evidence_urls' => $this->evidence_urls ?? [],
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'handled_at' => optional($this->handled_at)->toIso8601String(),
            'resolution_notes' => $this->resolution_notes,
            'reporter' => $this->whenLoaded('reporter', function () {
                return [
                    'id' => $this->reporter->id,
                    'display_name' => $this->reporter->display_name,
                    'handle' => $this->reporter->handle,
                    'status' => $this->reporter->status,
                ];
            }),
            'handled_by' => $this->whenLoaded('handledBy', function () {
                return [
                    'id' => $this->handledBy->id,
                    'display_name' => $this->handledBy->display_name,
                    'handle' => $this->handledBy->handle,
                    'role' => $this->handledBy->role,
                ];
            }),
            'target_snapshot' => $this->formatTargetSnapshot(),
        ];
    }

    protected function formatTargetSnapshot(): ?array
    {
        $target = $this->whenLoaded('target');

        if ($target === null) {
            return null;
        }

        return match ($this->target_type) {
            'user' => [
                'id' => $target->id,
                'display_name' => $target->display_name,
                'handle' => $target->handle,
                'status' => $target->status,
            ],
            'post' => [
                'id' => $target->id,
                'author_id' => $target->author_id,
                'excerpt' => $target->content ? Str::limit($target->content, 120) : null,
                'created_at' => optional($target->created_at)->toIso8601String(),
            ],
            'comment' => [
                'id' => $target->id,
                'post_id' => $target->post_id,
                'author_id' => $target->author_id,
                'excerpt' => $target->content ? Str::limit($target->content, 120) : null,
            ],
            'campaign' => [
                'id' => $target->id,
                'name' => $target->name,
                'status' => $target->status,
                'owner_id' => $target->owner_id,
            ],
            default => [
                'id' => $target->id,
            ],
        };
    }
}


