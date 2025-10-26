<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends Model
{
    protected $table = 'sessions';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at, revoked_at only

    protected $fillable = [
        'user_id',
        'created_at',
        'expires_at',
        'user_agent',
        'ip_addr',
        'revoked',
        'revoked_at',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'revoked' => 'boolean',
        'created_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


