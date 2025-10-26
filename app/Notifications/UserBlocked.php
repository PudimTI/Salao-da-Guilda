<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserBlocked extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $blocker;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $blocker)
    {
        $this->blocker = $blocker;
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
            ->subject('Você foi bloqueado')
            ->greeting('Olá!')
            ->line("{$this->blocker->display_name} (@{$this->blocker->handle}) bloqueou você.")
            ->line('Você não pode mais interagir com este usuário na plataforma.')
            ->action('Explorar usuários', url('/usuarios'))
            ->salutation('Atenciosamente, Equipe Salão da Guilda');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'user_blocked',
            'blocker_user_id' => $this->blocker->id,
            'blocker_user_name' => $this->blocker->display_name,
            'blocker_user_handle' => $this->blocker->handle,
            'blocker_user_avatar' => $this->blocker->avatar_url,
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
