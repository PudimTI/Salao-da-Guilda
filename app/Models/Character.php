<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Character extends Model
{
    protected $table = 'characters';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'name',
        'level',
        'summary',
        'backstory',
        'system',
    ];

    protected $casts = [
        'id' => 'int',
        'level' => 'int',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'character_campaign_links', 'character_id', 'campaign_id')
            ->withPivot(['player_id', 'joined_at', 'role_note']);
    }

    /**
     * Scope para filtrar personagens por sistema
     */
    public function scopeBySystem(Builder $query, string $system): Builder
    {
        return $query->where('system', $system);
    }

    /**
     * Scope para filtrar personagens por nível mínimo
     */
    public function scopeMinLevel(Builder $query, int $level): Builder
    {
        return $query->where('level', '>=', $level);
    }

    /**
     * Scope para filtrar personagens por nível máximo
     */
    public function scopeMaxLevel(Builder $query, int $level): Builder
    {
        return $query->where('level', '<=', $level);
    }

    /**
     * Verifica se o personagem está disponível (não está em campanhas ativas)
     */
    public function isAvailable(): bool
    {
        return $this->campaigns()->where('status', 'active')->count() === 0;
    }

    /**
     * Obtém o número de campanhas ativas que o personagem participa
     */
    public function getActiveCampaignsCount(): int
    {
        return $this->campaigns()->where('status', 'active')->count();
    }

    /**
     * Obtém a primeira campanha ativa do personagem
     */
    public function getPrimaryCampaign(): ?Campaign
    {
        return $this->campaigns()->where('status', 'active')->first();
    }

    /**
     * Verifica se o personagem pertence a um usuário específico
     */
    public function belongsToUser(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Obtém o resumo truncado do personagem
     */
    public function getTruncatedSummary(int $length = 100): string
    {
        return $this->summary ? Str::limit($this->summary, $length) : '';
    }

    /**
     * Obtém a história de fundo truncada do personagem
     */
    public function getTruncatedBackstory(int $length = 200): string
    {
        return $this->backstory ? Str::limit($this->backstory, $length) : '';
    }

    /**
     * Obtém o nome completo do sistema de RPG
     */
    public function getSystemDisplayName(): string
    {
        $systems = [
            'D&D 5e' => 'Dungeons & Dragons 5ª Edição',
            'D&D 3.5' => 'Dungeons & Dragons 3.5',
            'Pathfinder' => 'Pathfinder 1ª Edição',
            'Pathfinder 2e' => 'Pathfinder 2ª Edição',
            'Call of Cthulhu' => 'Call of Cthulhu',
            'Vampire: The Masquerade' => 'Vampire: The Masquerade',
            'World of Darkness' => 'World of Darkness',
            'GURPS' => 'GURPS',
            'Savage Worlds' => 'Savage Worlds',
            'FATE' => 'FATE Core',
            'Cypher System' => 'Cypher System',
            'Powered by the Apocalypse' => 'Powered by the Apocalypse',
        ];

        return $systems[$this->system] ?? $this->system;
    }

    /**
     * Obtém o avatar padrão baseado no sistema
     */
    public function getDefaultAvatar(): string
    {
        $avatars = [
            'D&D 5e' => '🏰',
            'D&D 3.5' => '🐉',
            'Pathfinder' => '⚔️',
            'Pathfinder 2e' => '🗡️',
            'Call of Cthulhu' => '🐙',
            'Vampire: The Masquerade' => '🦇',
            'World of Darkness' => '🌙',
            'GURPS' => '📊',
            'Savage Worlds' => '🤠',
            'FATE' => '🎲',
            'Cypher System' => '🔮',
            'Powered by the Apocalypse' => '📖',
        ];

        return $avatars[$this->system] ?? '👤';
    }
}


