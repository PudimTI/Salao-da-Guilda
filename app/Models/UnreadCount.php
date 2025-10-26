<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnreadCount extends Model
{
    protected $table = 'unread_counts';
    protected $primaryKey = null; // composite key
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // updated_at only

    protected $fillable = [
        'user_id',
        'type',
        'count',
        'updated_at',
    ];

    protected $casts = [
        'user_id' => 'int',
        'count' => 'int',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


