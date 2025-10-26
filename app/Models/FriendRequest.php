<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FriendRequest extends Model
{
    protected $table = 'friend_requests';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'status',
        'message',
        'created_at',
        'responded_at',
    ];

    protected $casts = [
        'id' => 'int',
        'from_user_id' => 'int',
        'to_user_id' => 'int',
        'created_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}


