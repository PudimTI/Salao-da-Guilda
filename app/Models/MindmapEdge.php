<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapEdge extends Model
{
    protected $table = 'mindmap_edges';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'campaign_id',
        'source_node_id',
        'target_node_id',
        'label',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'source_node_id' => 'int',
        'target_node_id' => 'int',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(MindmapNode::class, 'source_node_id');
    }

    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(MindmapNode::class, 'target_node_id');
    }
}


