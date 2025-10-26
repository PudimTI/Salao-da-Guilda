<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapNodeFile extends Model
{
    protected $table = 'mindmap_node_files';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'node_id',
        'file_id',
    ];

    protected $casts = [
        'id' => 'int',
        'node_id' => 'int',
        'file_id' => 'int',
    ];

    public function node(): BelongsTo
    {
        return $this->belongsTo(MindmapNode::class, 'node_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(CampaignFile::class, 'file_id');
    }
}
