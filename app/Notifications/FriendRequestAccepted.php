<?php

namespace App\Notifications;

use App\Models\FriendRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FriendRequestAccepted extends Notification implements ShouldQueue
{
    use Queueable;

    protected FriendRequest $friendRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(FriendRequest $friendRequest)
    {
        $this->friendRequest = $friendRequest;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $toUser = $this->friendRequest->toUser;
        
        return (new MailMessage)
            ->subject('Solicitação de amizade aceita!')
            ->greeting('Parabéns!')
            ->line("{$toUser->display_name} (@{$toUser->handle}) aceitou sua solicitação de amizade!")
            ->action('Ver perfil', url("/perfil/{$toUser->handle}"))
            ->line('Agora vocês são amigos e podem interagir livremente.')
            ->salutation('Atenciosamente, Equipe Salão da Guilda');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $toUser = $this->friendRequest->toUser;
        
        return [
            'type' => 'friend_request_accepted',
            'to_user_id' => $toUser->id,
            'to_user_name' => $toUser->display_name,
            'to_user_handle' => $toUser->handle,
            'to_user_avatar' => $toUser->avatar_url,
            'request_id' => $this->friendRequest->id,
            'created_at' => now()
        ];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}
