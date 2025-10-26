<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'visibility' => $this->visibility,
            'created_at' => $this->created_at,
            'reply_to_post_id' => $this->reply_to_post_id,
            
            // Author information
            'author' => [
                'id' => $this->author->id,
                'display_name' => $this->author->display_name,
                'handle' => $this->author->handle,
                'avatar_url' => $this->author->avatar_url,
            ],
            
            // Media attachments
            'media' => $this->getMedia('attachments')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'type' => $media->mime_type,
                    'name' => $media->name,
                    'size' => $media->size,
                    'thumb_url' => $media->getUrl('thumb'),
                ];
            }),
            
            // Interaction counts
            'likes_count' => $this->when($this->relationLoaded('likes'), function () {
                return $this->likes->count();
            }),
            'comments_count' => $this->when($this->relationLoaded('comments'), function () {
                return $this->comments->count();
            }),
            'reposts_count' => $this->when($this->relationLoaded('reposts'), function () {
                return $this->reposts->count();
            }),
            
            // User interaction status
            'is_liked' => $this->when($this->relationLoaded('likes') && Auth::check(), function () {
                return $this->likes->contains('user_id', Auth::id());
            }),
            'is_reposted' => $this->when($this->relationLoaded('reposts') && Auth::check(), function () {
                return $this->reposts->contains('user_id', Auth::id());
            }),
            
            // Comments (if loaded)
            'comments' => $this->when($this->relationLoaded('comments'), function () {
                return $this->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'created_at' => $comment->created_at,
                        'author' => [
                            'id' => $comment->author->id,
                            'display_name' => $comment->author->display_name,
                            'handle' => $comment->author->handle,
                            'avatar_url' => $comment->author->avatar_url,
                        ],
                    ];
                });
            }),
            
            // Mentions (if loaded)
            'mentions' => $this->when($this->relationLoaded('mentions'), function () {
                return $this->mentions->map(function ($mention) {
                    return [
                        'id' => $mention->id,
                        'mentioned_user' => [
                            'id' => $mention->mentionedUser->id,
                            'display_name' => $mention->mentionedUser->display_name,
                            'handle' => $mention->mentionedUser->handle,
                            'avatar_url' => $mention->mentionedUser->avatar_url,
                        ],
                    ];
                });
            }),
            
            // Repost information (if this is a repost)
            'original_post' => $this->when($this->reply_to_post_id, function () {
                return $this->originalPost ? new PostResource($this->originalPost) : null;
            }),

            // Tags (if loaded)
            'tags' => $this->when($this->relationLoaded('tags'), function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'type' => $tag->type,
                    ];
                });
            }),
        ];
    }
}
