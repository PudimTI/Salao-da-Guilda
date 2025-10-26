<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RecommendationCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'types' => $this->getTypesSummary(),
                'score_range' => $this->getScoreRange(),
                'generated_at' => $this->collection->first()?->generated_at?->toISOString()
            ]
        ];
    }

    /**
     * Obter resumo dos tipos de recomendação
     */
    private function getTypesSummary(): array
    {
        $types = $this->collection->groupBy('target_type');
        
        return [
            'campaign' => $types->get('campaign', collect())->count(),
            'post' => $types->get('post', collect())->count()
        ];
    }

    /**
     * Obter faixa de scores das recomendações
     */
    private function getScoreRange(): array
    {
        if ($this->collection->isEmpty()) {
            return [
                'min' => 0,
                'max' => 0,
                'avg' => 0
            ];
        }

        $scores = $this->collection->pluck('score');
        
        return [
            'min' => round($scores->min(), 3),
            'max' => round($scores->max(), 3),
            'avg' => round($scores->avg(), 3)
        ];
    }
}
