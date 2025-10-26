<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'user_id',
        'type',
        'payload',
        'created_at',
        'read',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'payload' => 'array',
        'created_at' => 'datetime',
        'read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


