<?php

namespace App\Notifications;

use App\Models\FriendRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FriendRequestRejected extends Notification implements ShouldQueue
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
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $toUser = $this->friendRequest->toUser;
        
        return (new MailMessage)
            ->subject('Solicitação de amizade não aceita')
            ->greeting('Olá!')
            ->line("Sua solicitação de amizade para {$toUser->display_name} (@{$toUser->handle}) não foi aceita.")
            ->line('Não se preocupe, você pode continuar interagindo com outros usuários da plataforma.')
            ->action('Explorar usuários', url('/usuarios'))
            ->salutation('Atenciosamente, Equipe Salão da Guilda');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $toUser = $this->friendRequest->toUser;
        
        return [
            'type' => 'friend_request_rejected',
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
