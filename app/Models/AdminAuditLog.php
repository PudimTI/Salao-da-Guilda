<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminAuditLog extends Model
{
    protected $table = 'admin_audit_logs';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'admin_id',
        'entity_type',
        'entity_id',
        'operation',
        'details',
        'acted_at',
    ];

    protected $casts = [
        'id' => 'int',
        'admin_id' => 'int',
        'entity_id' => 'int',
        'acted_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}


