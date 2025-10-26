<?php

namespace App\Notifications;

use App\Models\FriendRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FriendRequestReceived extends Notification implements ShouldQueue
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
        $fromUser = $this->friendRequest->fromUser;
        
        return (new MailMessage)
            ->subject('Nova solicitação de amizade')
            ->greeting('Olá!')
            ->line("{$fromUser->display_name} (@{$fromUser->handle}) enviou uma solicitação de amizade para você.")
            ->line($this->friendRequest->message ? "Mensagem: {$this->friendRequest->message}" : '')
            ->action('Ver solicitação', url('/perfil/amigos/solicitacoes'))
            ->line('Você pode aceitar ou rejeitar a solicitação acessando seu perfil.')
            ->salutation('Atenciosamente, Equipe Salão da Guilda');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $fromUser = $this->friendRequest->fromUser;
        
        return [
            'type' => 'friend_request',
            'from_user_id' => $fromUser->id,
            'from_user_name' => $fromUser->display_name,
            'from_user_handle' => $fromUser->handle,
            'from_user_avatar' => $fromUser->avatar_url,
            'message' => $this->friendRequest->message,
            'request_id' => $this->friendRequest->id,
            'created_at' => $this->friendRequest->created_at
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
