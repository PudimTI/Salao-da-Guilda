<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Scout\Searchable;

class Tag extends Model
{
    use Searchable;

    protected $table = 'tags';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'type',
        'description',
        'synonyms',
        'usage_count',
        'is_moderated',
    ];

    protected $casts = [
        'id' => 'int',
        'synonyms' => 'array',
        'usage_count' => 'int',
        'is_moderated' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'usage_count' => 0,
        'is_moderated' => false,
    ];

    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_tags', 'tag_id', 'campaign_id')
            ->withPivot(['created_at']);
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tags', 'tag_id', 'post_id')
            ->withPivot(['created_at']);
    }

    /**
     * Scope para buscar tags por nome (case insensitive)
     */
    public function scopeSearchByName(Builder $query, string $search): Builder
    {
        return $query->where('name', 'ilike', "%{$search}%");
    }

    /**
     * Scope para buscar tags por tipo
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para tags moderadas
     */
    public function scopeModerated(Builder $query): Builder
    {
        return $query->where('is_moderated', true);
    }

    /**
     * Scope para tags não moderadas
     */
    public function scopeNotModerated(Builder $query): Builder
    {
        return $query->where('is_moderated', false);
    }

    /**
     * Buscar tags por sinônimos
     */
    public function scopeSearchBySynonyms(Builder $query, string $search): Builder
    {
        return $query->whereJsonContains('synonyms', $search);
    }

    /**
     * Incrementar contador de uso
     */
    public function incrementUsageCount(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Decrementar contador de uso
     */
    public function decrementUsageCount(): void
    {
        $this->decrement('usage_count');
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            'synonyms' => $this->synonyms ?? [],
            'usage_count' => $this->usage_count,
            'is_moderated' => $this->is_moderated,
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'tags_index';
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return true;
    }
}


