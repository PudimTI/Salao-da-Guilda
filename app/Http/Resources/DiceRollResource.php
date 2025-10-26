<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiceRollResource extends JsonResource
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
            'campaign_id' => $this->campaign_id,
            'roller_id' => $this->roller_id,
            'formula' => $this->formula,
            'result' => $this->result,
            'detail' => $this->detail,
            'created_at' => $this->created_at,
            'roller' => [
                'id' => $this->roller->id,
                'name' => $this->roller->name,
                'handle' => $this->roller->handle,
                'avatar' => $this->roller->avatar
            ],
            'campaign' => [
                'id' => $this->campaign->id,
                'name' => $this->campaign->name
            ]
        ];
    }
}
