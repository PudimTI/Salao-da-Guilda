<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationAction extends Model
{
    protected $table = 'moderation_actions';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'admin_id',
        'target_type',
        'target_id',
        'action',
        'reason',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'id' => 'int',
        'admin_id' => 'int',
        'target_id' => 'int',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}


