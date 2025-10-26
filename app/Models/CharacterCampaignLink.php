<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CharacterCampaignLink extends Model
{
    protected $table = 'character_campaign_links';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'character_id',
        'campaign_id',
        'player_id',
        'joined_at',
        'role_note',
    ];

    protected $casts = [
        'id' => 'int',
        'character_id' => 'int',
        'campaign_id' => 'int',
        'player_id' => 'int',
        'joined_at' => 'datetime',
    ];

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class, 'character_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
