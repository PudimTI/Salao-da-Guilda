<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message->load(['sender', 'repliedTo.sender', 'conversation.participants']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $data = [
            'message' => [
                'id' => $this->message->id,
                'content' => $this->message->content,
                'media_url' => $this->message->media_url,
                'reply_to' => $this->message->reply_to,
                'created_at' => $this->message->created_at,
                'edited_at' => $this->message->edited_at,
                'sender' => [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                    'display_name' => $this->message->sender->display_name ?? $this->message->sender->name,
                    'handle' => $this->message->sender->handle,
                    'avatar' => $this->message->sender->avatar_url ?? null,
                ],
                'conversation_id' => $this->message->conversation_id,
            ]
        ];
        
        // Incluir dados da mensagem respondida se existir
        if ($this->message->repliedTo) {
            $data['message']['replied_to_message'] = [
                'id' => $this->message->repliedTo->id,
                'content' => $this->message->repliedTo->content,
                'sender' => [
                    'id' => $this->message->repliedTo->sender->id,
                    'name' => $this->message->repliedTo->sender->name,
                    'handle' => $this->message->repliedTo->sender->handle,
                ],
            ];
        }
        
        return $data;
    }
}
