<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $table = 'user_preferences';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // only updated_at

    protected $fillable = [
        'user_id',
        'systems',
        'styles',
        'dynamics',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'int',
        'user_id' => 'int',
        'systems' => 'array',
        'styles' => 'array',
        'dynamics' => 'array',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


