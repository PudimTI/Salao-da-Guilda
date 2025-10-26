<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FriendshipRemoved extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $remover;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $remover)
    {
        $this->remover = $remover;
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
        return (new MailMessage)
            ->subject('Amizade removida')
            ->greeting('Olá!')
            ->line("{$this->remover->display_name} (@{$this->remover->handle}) removeu você da lista de amigos.")
            ->line('Vocês não são mais amigos na plataforma.')
            ->action('Explorar usuários', url('/usuarios'))
            ->salutation('Atenciosamente, Equipe Salão da Guilda');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'friendship_removed',
            'remover_user_id' => $this->remover->id,
            'remover_user_name' => $this->remover->display_name,
            'remover_user_handle' => $this->remover->handle,
            'remover_user_avatar' => $this->remover->avatar_url,
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
