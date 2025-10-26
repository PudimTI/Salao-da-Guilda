<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostCommented extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post,
        public Comment $comment,
        public User $commenter
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Novo comentário no seu post!')
            ->greeting('Olá!')
            ->line("{$this->commenter->display_name} comentou no seu post.")
            ->line("Comentário: " . substr($this->comment->content, 0, 100) . '...')
            ->action('Ver Post', url('/posts/' . $this->post->id))
            ->line('Obrigado por usar nossa plataforma!');
    }

    public function toArray($notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'comment_id' => $this->comment->id,
            'commenter_id' => $this->commenter->id,
            'commenter_name' => $this->commenter->display_name,
            'commenter_handle' => $this->commenter->handle,
            'comment_content' => substr($this->comment->content, 0, 100),
            'post_content' => substr($this->post->content, 0, 100),
            'type' => 'post_commented',
        ];
    }
}
