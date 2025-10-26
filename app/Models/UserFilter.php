<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFilter extends Model
{
    protected $table = 'user_filters';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // only updated_at

    protected $fillable = [
        'user_id',
        'whitelist_tags',
        'blacklist_tags',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'whitelist_tags' => 'array',
        'blacklist_tags' => 'array',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


