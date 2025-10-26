<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Post;
use App\Models\Tag;
use App\Models\Recommendation;
use App\Models\UserPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class RecommendationControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_user_recommendations()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar recomendações para o usuário
        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Baseado nas suas preferências',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->getJson('/api/recommendations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'target_type',
                            'target_id',
                            'score',
                            'reason',
                            'target'
                        ]
                    ],
                    'meta'
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_generate_new_recommendations()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar dados de teste
        $campaign = Campaign::factory()->create([
            'status' => 'active',
            'visibility' => 'public'
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'systems' => ['D&D 5e'],
            'styles' => ['Fantasia'],
            'dynamics' => ['Roleplay']
        ]);

        $response = $this->postJson('/api/recommendations/generate', [
            'limit' => 5
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'meta'
            ]);
    }

    /** @test */
    public function it_can_mark_recommendation_as_viewed()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $recommendation = Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Teste',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->postJson("/api/recommendations/{$recommendation->id}/view");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Recomendação marcada como visualizada'
            ]);
    }

    /** @test */
    public function it_can_get_recommendation_stats()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar algumas recomendações
        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Teste 1',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'post',
            'target_id' => 1,
            'score' => 0.6,
            'reason' => 'Teste 2',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->getJson('/api/recommendations/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_recommendations',
                    'active_recommendations',
                    'campaign_recommendations',
                    'post_recommendations',
                    'avg_score',
                    'last_generated'
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_clear_recommendation_cache()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/recommendations/cache');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Cache de recomendações limpo com sucesso'
            ]);
    }

    /** @test */
    public function it_validates_request_parameters()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Testar parâmetros inválidos
        $response = $this->getJson('/api/recommendations?limit=100&min_score=2.0');

        $response->assertStatus(400)
            ->assertJsonStructure([
                'success',
                'message',
                'errors'
            ]);
    }

    /** @test */
    public function it_prevents_duplicate_generation()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar recomendação recente
        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Teste',
            'generated_at' => now()->subMinutes(30), // Recente
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->postJson('/api/recommendations/generate');

        $response->assertStatus(409)
            ->assertJsonStructure([
                'success',
                'message',
                'existing_count'
            ]);
    }

    /** @test */
    public function it_allows_forced_generation()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar recomendação recente
        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Teste',
            'generated_at' => now()->subMinutes(30),
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->postJson('/api/recommendations/generate', [
            'force' => true
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function it_filters_recommendations_by_type()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Criar recomendações de diferentes tipos
        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Campanha',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        Recommendation::create([
            'user_id' => $user->id,
            'target_type' => 'post',
            'target_id' => 1,
            'score' => 0.6,
            'reason' => 'Post',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        // Filtrar apenas campanhas
        $response = $this->getJson('/api/recommendations?type=campaign');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('campaign', $data[0]['target_type']);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/recommendations');
        $response->assertStatus(401);
    }

    /** @test */
    public function it_prevents_access_to_other_users_recommendations()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Sanctum::actingAs($user1);

        $recommendation = Recommendation::create([
            'user_id' => $user2->id, // Recomendação de outro usuário
            'target_type' => 'campaign',
            'target_id' => 1,
            'score' => 0.8,
            'reason' => 'Teste',
            'generated_at' => now(),
            'valid_until' => now()->addDays(7)
        ]);

        $response = $this->postJson("/api/recommendations/{$recommendation->id}/view");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Recomendação não encontrada'
            ]);
    }
}
