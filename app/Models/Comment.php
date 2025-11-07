<?php

namespace App\Models;

use App\Traits\Reportable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use Reportable;
    protected $table = 'comments';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'post_id',
        'author_id',
        'content',
        'created_at',
    ];

    protected $casts = [
        'id' => 'int',
        'post_id' => 'int',
        'author_id' => 'int',
        'created_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}


