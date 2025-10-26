<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Post extends Model implements HasMedia
{
    use Searchable, InteractsWithMedia;

    protected $table = 'posts';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'author_id',
        'content',
        'created_at',
        'visibility',
        'reply_to_post_id',
    ];

    protected $casts = [
        'id' => 'int',
        'created_at' => 'datetime',
        'reply_to_post_id' => 'int',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }


    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'post_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Repost::class, 'post_id');
    }

    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class, 'post_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tags', 'post_id', 'tag_id')
            ->withPivot(['created_at']);
    }

    public function originalPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'reply_to_post_id');
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'visibility' => $this->visibility,
            'author_name' => $this->author->name ?? '',
            'author_username' => $this->author->username ?? '',
            'created_at' => $this->created_at?->toISOString(),
            'likes_count' => $this->likes()->count(),
            'comments_count' => $this->comments()->count(),
            'reposts_count' => $this->reposts()->count(),
            'tags' => $this->tags->pluck('name')->toArray(),
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->visibility === 'public';
    }

    /**
     * Register media collections for the model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov']);
    }

    /**
     * Register media conversions for the model.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10);
    }
}


