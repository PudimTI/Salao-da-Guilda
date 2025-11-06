<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $table = 'messages';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // created_at only

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'media_url',
        'reply_to',
        'created_at',
        'edited_at',
    ];

    protected $casts = [
        'id' => 'int',
        'conversation_id' => 'int',
        'sender_id' => 'int',
        'reply_to' => 'int',
        'created_at' => 'datetime',
        'edited_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function repliedTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to');
    }

    public function readMarkers(): HasMany
    {
        return $this->hasMany(MessageReadMarker::class, 'last_read_message_id');
    }
}


