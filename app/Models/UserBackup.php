<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    protected $table = 'users';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // only created_at, last_login_at provided

    protected $fillable = [
        'handle',
        'email',
        'password_hash',
        'display_name',
        'avatar_url',
        'bio',
        'status',
        'last_login_at',
    ];

    protected $casts = [
        'id' => 'int',
        'last_login_at' => 'datetime',
    ];

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
}


