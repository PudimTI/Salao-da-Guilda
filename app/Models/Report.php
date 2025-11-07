<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Report extends Model
{
    protected $table = 'reports';
    public $incrementing = true;
    protected $keyType = 'int';

    public const STATUS_OPEN = 'open';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_DISMISSED = 'dismissed';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_UNDER_REVIEW,
        self::STATUS_RESOLVED,
        self::STATUS_DISMISSED,
    ];

    protected $fillable = [
        'reporter_id',
        'target_type',
        'target_id',
        'reason_text',
        'evidence_urls',
        'status',
        'handled_by',
        'handled_at',
        'resolution_notes',
    ];

    protected $casts = [
        'id' => 'int',
        'reporter_id' => 'int',
        'target_id' => 'int',
        'evidence_urls' => 'array',
        'handled_by' => 'int',
        'handled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $report): void {
            $report->target_type = strtolower((string) $report->target_type);

            if (empty($report->status)) {
                $report->status = self::STATUS_OPEN;
            }
        });

        static::updating(function (self $report): void {
            if ($report->isDirty('target_type')) {
                $report->target_type = strtolower((string) $report->target_type);
            }
        });
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    public function transitionTo(string $status, ?User $actor = null, ?string $notes = null): void
    {
        if (! in_array($status, self::STATUSES, true)) {
            throw new \InvalidArgumentException("Invalid report status: {$status}");
        }

        $this->status = $status;

        if ($actor !== null) {
            $this->handled_by = $actor->id;
            $this->handled_at = now();
        }

        if ($notes !== null) {
            $this->resolution_notes = $notes;
        }

        $this->save();
    }
}


