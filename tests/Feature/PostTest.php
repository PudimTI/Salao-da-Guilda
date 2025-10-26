<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use App\Models\Like;
use App\Models\Repost;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    /** @test */
    public function user_can_create_post()
    {
        $postData = [
            'content' => 'Este é um post de teste',
            'visibility' => 'public',
        ];

        $response = $this->postJson('/api/posts', $postData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'post' => [
                        'id',
                        'content',
                        'author',
                        'created_at',
                    ]
                ]);

        $this->assertDatabaseHas('posts', [
            'content' => 'Este é um post de teste',
            'visibility' => 'public',
        ]);
    }

    /** @test */
    public function user_can_view_posts()
    {
        Post::factory()->count(3)->create();

        $response = $this->getJson('/api/posts');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'posts' => [
                        'data' => [
                            '*' => [
                                'id',
                                'content',
                                'author',
                                'created_at',
                            ]
                        ]
                    ]
                ]);
    }

    /** @test */
    public function user_can_like_post()
    {
        $post = Post::factory()->create();
        $user = auth()->user();

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post curtido',
                    'liked' => true,
                ]);

        $this->assertDatabaseHas('likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function user_can_unlike_post()
    {
        $post = Post::factory()->create();
        $user = auth()->user();
        
        // Primeiro curtir
        Like::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Curtida removida',
                    'liked' => false,
                ]);

        $this->assertDatabaseMissing('likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function user_can_repost()
    {
        $post = Post::factory()->create();
        $user = auth()->user();

        $response = $this->postJson("/api/posts/{$post->id}/repost");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post repostado',
                    'reposted' => true,
                ]);

        $this->assertDatabaseHas('reposts', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function user_can_comment_on_post()
    {
        $post = Post::factory()->create();
        $commentData = [
            'content' => 'Este é um comentário de teste',
        ];

        $response = $this->postJson("/api/posts/{$post->id}/comment", $commentData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'comment' => [
                        'id',
                        'content',
                        'author',
                    ]
                ]);

        $this->assertDatabaseHas('comments', [
            'post_id' => $post->id,
            'content' => 'Este é um comentário de teste',
        ]);
    }

    /** @test */
    public function user_can_update_own_post()
    {
        $user = auth()->user();
        $post = Post::factory()->create(['author_id' => $user->id]);

        $updateData = [
            'content' => 'Conteúdo atualizado',
            'visibility' => 'private',
        ];

        $response = $this->putJson("/api/posts/{$post->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post atualizado com sucesso',
                ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'content' => 'Conteúdo atualizado',
            'visibility' => 'private',
        ]);
    }

    /** @test */
    public function user_cannot_update_other_user_post()
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['author_id' => $otherUser->id]);

        $updateData = [
            'content' => 'Tentativa de hack',
        ];

        $response = $this->putJson("/api/posts/{$post->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_own_post()
    {
        $user = auth()->user();
        $post = Post::factory()->create(['author_id' => $user->id]);

        $response = $this->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post excluído com sucesso',
                ]);

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    /** @test */
    public function user_cannot_delete_other_user_post()
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['author_id' => $otherUser->id]);

        $response = $this->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function post_validation_works()
    {
        $response = $this->postJson('/api/posts', [
            'content' => '', // Vazio
            'visibility' => 'invalid', // Inválido
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['content', 'visibility']);
    }

    /** @test */
    public function post_content_has_max_length()
    {
        $longContent = str_repeat('a', 2001); // Mais que 2000 caracteres

        $response = $this->postJson('/api/posts', [
            'content' => $longContent,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['content']);
    }

    /** @test */
    public function user_can_create_post_with_media()
    {
        // Criar um arquivo de teste real no diretório do projeto
        $testImagePath = storage_path('app/test_image.jpg');
        
        // Criar uma imagem de teste real
        $image = imagecreate(100, 100);
        $backgroundColor = imagecolorallocate($image, 255, 255, 255);
        $textColor = imagecolorallocate($image, 0, 0, 0);
        imagestring($image, 5, 10, 40, 'TEST', $textColor);
        imagejpeg($image, $testImagePath, 90);
        imagedestroy($image);
        
        // Criar UploadedFile a partir do arquivo real
        $file = new \Illuminate\Http\UploadedFile(
            $testImagePath,
            'test.jpg',
            'image/jpeg',
            null,
            true
        );
        
        $postData = [
            'content' => 'Post com mídia de teste',
            'visibility' => 'public',
        ];

        $response = $this->post('/api/posts', array_merge($postData, [
            'media' => [$file]
        ]));
        
        // Limpar arquivo de teste (se ainda existir)
        if (file_exists($testImagePath)) {
            unlink($testImagePath);
        }

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'post' => [
                        'id',
                        'content',
                        'author',
                        'media' => [
                            '*' => [
                                'id',
                                'url',
                                'type',
                                'name',
                                'size'
                            ]
                        ],
                        'created_at',
                    ]
                ]);

        $this->assertDatabaseHas('posts', [
            'content' => 'Post com mídia de teste',
            'visibility' => 'public',
        ]);

        // Verificar se os dados foram salvos na tabela post_media
        $this->assertDatabaseHas('post_media', [
            'post_id' => $response->json('post.id'),
            'type' => 'image/jpeg'
        ]);

        // Verificar se a URL foi salva
        $postMedia = \App\Models\PostMedia::where('post_id', $response->json('post.id'))->first();
        $this->assertNotNull($postMedia);
        $this->assertStringContainsString('http://localhost/storage/', $postMedia->url);
        $this->assertEquals(0, $postMedia->position);
    }

    /** @test */
    public function test_upload_endpoint_works()
    {
        $file = \Illuminate\Http\UploadedFile::fake()->image('test.jpg', 100, 100);
        
        $response = $this->postJson('/test-upload', [
            'media' => [$file]
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'files' => [
                        '*' => [
                            'name',
                            'size',
                            'mime'
                        ]
                    ],
                    'count'
                ]);
    }

    /** @test */
    public function post_validation_with_media_works()
    {
        $file = \Illuminate\Http\UploadedFile::fake()->image('test.jpg', 100, 100);
        
        $response = $this->postJson('/api/posts', [
            'content' => '', // Vazio - deve falhar
            'visibility' => 'public',
        ], [
            'media' => [$file]
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['content']);
    }
}
