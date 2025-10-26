<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $table = 'reports';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'reporter_id',
        'target_type',
        'target_id',
        'reason_text',
        'evidence_urls',
        'status',
    ];

    protected $casts = [
        'id' => 'int',
        'reporter_id' => 'int',
        'target_id' => 'int',
        'evidence_urls' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}


