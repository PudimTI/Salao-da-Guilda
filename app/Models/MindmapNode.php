<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MindmapNode extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'mindmap_nodes';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // updated_at only

    protected $fillable = [
        'campaign_id',
        'title',
        'notes',
        'pos_x',
        'pos_y',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'pos_x' => 'decimal:2',
        'pos_y' => 'decimal:2',
        'updated_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(MindmapEdge::class, 'source_node_id');
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(MindmapEdge::class, 'target_node_id');
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(CampaignFile::class, 'mindmap_node_files', 'node_id', 'file_id');
    }

    /**
     * Configurar coleções de mídia para Spatie Media Library
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'])
            ->singleFile();
    }

    /**
     * Configurar conversões de mídia
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10)
            ->performOnCollections('attachments');
    }
}


