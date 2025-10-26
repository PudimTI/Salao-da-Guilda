<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InteractionEvent extends Model
{
    protected $table = 'interaction_events';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',
        'target_type',
        'target_id',
        'tags_snapshot',
        'occurred_at',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'target_id' => 'int',
        'tags_snapshot' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


