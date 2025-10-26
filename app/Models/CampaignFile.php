<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignFile extends Model
{
    protected $table = 'campaign_files';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // uploaded_at only

    protected $fillable = [
        'campaign_id',
        'uploaded_by',
        'name',
        'type',
        'size',
        'url',
        'uploaded_at',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'uploaded_by' => 'int',
        'size' => 'int',
        'uploaded_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}


