<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Campaign extends Model
{
    use Searchable;

    protected $table = 'campaigns';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'system',
        'type',
        'city',
        'rules',
        'status',
        'visibility',
    ];

    protected $casts = [
        'id' => 'int',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'campaign_members', 'campaign_id', 'user_id')
            ->withPivot(['role', 'status', 'joined_at']);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'campaign_tags', 'campaign_id', 'tag_id')
            ->withPivot(['created_at']);
    }

    public function files(): HasMany
    {
        return $this->hasMany(CampaignFile::class, 'campaign_id');
    }

    public function mindmapNodes(): HasMany
    {
        return $this->hasMany(MindmapNode::class, 'campaign_id');
    }

    public function diceRolls(): HasMany
    {
        return $this->hasMany(DiceRoll::class, 'campaign_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'campaign_id');
    }

    public function invites(): HasMany
    {
        return $this->hasMany(CampaignInvite::class, 'campaign_id');
    }

    public function characters(): BelongsToMany
    {
        return $this->belongsToMany(Character::class, 'character_campaign_links', 'campaign_id', 'character_id')
            ->withPivot(['player_id', 'joined_at', 'role_note']);
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'system' => $this->system,
            'type' => $this->type,
            'city' => $this->city,
            'rules' => $this->rules,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'owner_name' => $this->owner->name ?? '',
            'tags' => $this->tags->pluck('name')->toArray(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'campaigns_index';
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->status === 'active' && $this->visibility === 'public';
    }
}


