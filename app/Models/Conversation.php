<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $table = 'conversations';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at, last_activity_at handled manually

    protected $fillable = [
        'campaign_id',
        'type',
        'title',
        'created_at',
        'last_activity_at',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'created_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants', 'conversation_id', 'user_id')
            ->withPivot(['role', 'joined_at']);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }
}


