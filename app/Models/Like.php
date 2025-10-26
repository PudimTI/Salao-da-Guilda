<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    protected $table = 'likes';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'post_id',
        'user_id',
        'created_at',
    ];

    protected $casts = [
        'id' => 'int',
        'post_id' => 'int',
        'user_id' => 'int',
        'created_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


