<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiceRoll extends Model
{
    protected $table = 'dice_rolls';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'campaign_id',
        'roller_id',
        'formula',
        'result',
        'detail',
        'created_at',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'roller_id' => 'int',
        'result' => 'int',
        'detail' => 'array',
        'created_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function roller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'roller_id');
    }
}


