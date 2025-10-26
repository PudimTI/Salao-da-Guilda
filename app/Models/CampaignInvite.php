<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignInvite extends Model
{
    protected $table = 'campaign_invites';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'campaign_id',
        'inviter_id',
        'invitee_id',
        'status',
        'message',
        'sent_at',
        'responded_at',
    ];

    protected $casts = [
        'id' => 'int',
        'campaign_id' => 'int',
        'inviter_id' => 'int',
        'invitee_id' => 'int',
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }

    /**
     * Verifica se o convite está pendente
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Verifica se o convite foi aceito
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Verifica se o convite foi rejeitado
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Verifica se o convite foi cancelado
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Verifica se é uma auto-solicitação
     */
    public function isSelfInvite(): bool
    {
        return $this->inviter_id === $this->invitee_id;
    }

    /**
     * Scope para convites pendentes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para convites aceitos
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope para convites rejeitados
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope para auto-solicitações
     */
    public function scopeSelfInvites($query)
    {
        return $query->whereColumn('inviter_id', 'invitee_id');
    }
}
