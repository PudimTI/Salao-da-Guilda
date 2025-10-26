<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserMentioned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post,
        public User $mentioner
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Você foi mencionado em um post!')
            ->greeting('Olá!')
            ->line("{$this->mentioner->display_name} mencionou você em um post.")
            ->line("Conteúdo: " . substr($this->post->content, 0, 100) . '...')
            ->action('Ver Post', url('/posts/' . $this->post->id))
            ->line('Obrigado por usar nossa plataforma!');
    }

    public function toArray($notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'mentioner_id' => $this->mentioner->id,
            'mentioner_name' => $this->mentioner->display_name,
            'mentioner_handle' => $this->mentioner->handle,
            'post_content' => substr($this->post->content, 0, 100),
            'type' => 'user_mentioned',
        ];
    }
}
