<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Post;
use App\Policies\PostPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostPolicyTest extends TestCase
{
    use RefreshDatabase;

    private PostPolicy $policy;
    private User $user;
    private User $otherUser;
    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->policy = new PostPolicy();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->post = Post::factory()->create(['author_id' => $this->user->id]);
    }

    /** @test */
    public function user_can_view_own_posts()
    {
        $this->assertTrue($this->policy->view($this->user, $this->post));
    }

    /** @test */
    public function user_can_view_public_posts()
    {
        $publicPost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'public'
        ]);

        $this->assertTrue($this->policy->view($this->user, $publicPost));
    }

    /** @test */
    public function user_cannot_view_private_posts_of_others()
    {
        $privatePost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'private'
        ]);

        $this->assertFalse($this->policy->view($this->user, $privatePost));
    }

    /** @test */
    public function user_can_create_posts()
    {
        $this->assertTrue($this->policy->create($this->user));
    }

    /** @test */
    public function user_can_update_own_posts()
    {
        $this->assertTrue($this->policy->update($this->user, $this->post));
    }

    /** @test */
    public function user_cannot_update_other_user_posts()
    {
        $otherPost = Post::factory()->create(['author_id' => $this->otherUser->id]);
        
        $this->assertFalse($this->policy->update($this->user, $otherPost));
    }

    /** @test */
    public function user_can_delete_own_posts()
    {
        $this->assertTrue($this->policy->delete($this->user, $this->post));
    }

    /** @test */
    public function user_cannot_delete_other_user_posts()
    {
        $otherPost = Post::factory()->create(['author_id' => $this->otherUser->id]);
        
        $this->assertFalse($this->policy->delete($this->user, $otherPost));
    }

    /** @test */
    public function user_can_like_viewable_posts()
    {
        $publicPost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'public'
        ]);

        $this->assertTrue($this->policy->like($this->user, $publicPost));
    }

    /** @test */
    public function user_cannot_like_private_posts_of_others()
    {
        $privatePost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'private'
        ]);

        $this->assertFalse($this->policy->like($this->user, $privatePost));
    }

    /** @test */
    public function user_can_repost_viewable_posts()
    {
        $publicPost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'public'
        ]);

        $this->assertTrue($this->policy->repost($this->user, $publicPost));
    }

    /** @test */
    public function user_can_comment_on_viewable_posts()
    {
        $publicPost = Post::factory()->create([
            'author_id' => $this->otherUser->id,
            'visibility' => 'public'
        ]);

        $this->assertTrue($this->policy->comment($this->user, $publicPost));
    }
}
