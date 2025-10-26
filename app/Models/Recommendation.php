<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    protected $table = 'recommendations';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'target_type',
        'target_id',
        'score',
        'reason',
        'generated_at',
        'valid_until',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'target_id' => 'int',
        'score' => 'decimal:2',
        'generated_at' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


