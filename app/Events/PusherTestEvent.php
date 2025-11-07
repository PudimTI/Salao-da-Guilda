<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PusherTestEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $type;
    public $user;
    public $conversationId;

    /**
     * Create a new event instance.
     */
    public function __construct(string $message, string $type, ?User $user = null, ?int $conversationId = null)
    {
        $this->message = $message;
        $this->type = $type;
        $this->user = $user;
        $this->conversationId = $conversationId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        switch ($this->type) {
            case 'public':
                return [
                    new Channel('test-channel'),
                ];
            
            case 'private':
                return [
                    new PrivateChannel('test-user-' . $this->user->id),
                ];
            
            case 'conversation':
                return [
                    new PrivateChannel('conversation.' . $this->conversationId),
                ];
            
            default:
                return [
                    new Channel('test-channel'),
                ];
        }
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'test';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'timestamp' => now()->toISOString(),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'handle' => $this->user->handle,
            ] : null,
            'conversation_id' => $this->conversationId,
        ];
    }
}









