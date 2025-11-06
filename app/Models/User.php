<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'users';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'handle',
        'email',
        'password_hash',
        'display_name',
        'avatar_url',
        'bio',
        'status',
        'role',
        'last_login_at',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'id' => 'int',
        'email_verified_at' => 'datetime',
        'password_hash' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Get the user's name for Filament compatibility.
     * Returns display_name if available, otherwise handle, otherwise email.
     * This creates a virtual 'name' attribute that Filament expects.
     */
    public function getNameAttribute(): string
    {
        return $this->attributes['display_name'] ?? $this->attributes['handle'] ?? $this->attributes['email'] ?? '';
    }

    /**
     * Get the user's name (method for Filament compatibility).
     * Filament calls this method to get the user's name.
     */
    public function getName(): string
    {
        return $this->attributes['display_name'] ?? $this->attributes['handle'] ?? $this->attributes['email'] ?? '';
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class, 'user_id');
    }

    public function filters(): HasOne
    {
        return $this->hasOne(UserFilter::class, 'user_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class, 'user_id');
    }

    public function passwordResets(): HasMany
    {
        return $this->hasMany(PasswordReset::class, 'user_id');
    }

    public function characters(): HasMany
    {
        return $this->hasMany(Character::class, 'user_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'owner_id');
    }

    public function campaignMemberships(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_members', 'user_id', 'campaign_id')
            ->withPivot(['role', 'status', 'joined_at']);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants', 'user_id', 'conversation_id')
            ->withPivot(['role', 'joined_at']);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function friendRequestsSent(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'from_user_id');
    }

    public function friendRequestsReceived(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'to_user_id');
    }

    public function friendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    public function interactionEvents(): HasMany
    {
        return $this->hasMany(InteractionEvent::class, 'user_id');
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class, 'user_id');
    }

    public function diceRolls(): HasMany
    {
        return $this->hasMany(DiceRoll::class, 'roller_id');
    }

    public function uploadedCampaignFiles(): HasMany
    {
        return $this->hasMany(CampaignFile::class, 'uploaded_by');
    }

    /**
     * Verifica se o usuário possui um role específico
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Verifica se o usuário é administrador
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Verifica se o usuário é moderador
     */
    public function isModerator(): bool
    {
        return $this->hasRole('moderator') || $this->isAdmin();
    }

    /**
     * Verifica se o usuário pode acessar o painel Filament
     */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return $this->isAdmin();
    }
}