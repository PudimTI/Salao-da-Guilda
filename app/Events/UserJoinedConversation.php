<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserJoinedConversation implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;
    public $user;
    public $addedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(Conversation $conversation, User $user, User $addedBy = null)
    {
        $this->conversation = $conversation;
        $this->user = $user;
        $this->addedBy = $addedBy;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversation->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'user.joined';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'handle' => $this->user->handle,
                'avatar' => $this->user->avatar_url ?? null,
            ],
            'added_by' => $this->addedBy ? [
                'id' => $this->addedBy->id,
                'name' => $this->addedBy->name,
                'handle' => $this->addedBy->handle,
            ] : null,
            'conversation_id' => $this->conversation->id,
            'timestamp' => now()->toISOString(),
        ];
    }
}
