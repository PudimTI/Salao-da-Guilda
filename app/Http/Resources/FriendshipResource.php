<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendshipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'friend_id' => $this->friend_id,
            'state' => $this->state,
            'since' => $this->since,
            'friend' => new UserResource($this->whenLoaded('friend')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
