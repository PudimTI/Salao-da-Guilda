<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostReposted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post,
        public User $reposter
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Seu post foi repostado!')
            ->greeting('Olá!')
            ->line("{$this->reposter->display_name} repostou seu post.")
            ->line("Conteúdo: " . substr($this->post->content, 0, 100) . '...')
            ->action('Ver Post', url('/posts/' . $this->post->id))
            ->line('Obrigado por usar nossa plataforma!');
    }

    public function toArray($notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'reposter_id' => $this->reposter->id,
            'reposter_name' => $this->reposter->display_name,
            'reposter_handle' => $this->reposter->handle,
            'post_content' => substr($this->post->content, 0, 100),
            'type' => 'post_reposted',
        ];
    }
}
