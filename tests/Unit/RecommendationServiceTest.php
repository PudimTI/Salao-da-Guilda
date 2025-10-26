<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Post;
use App\Models\Tag;
use App\Models\UserPreference;
use App\Models\UserFilter;
use App\Models\Recommendation;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

class RecommendationServiceTest extends TestCase
{
    use RefreshDatabase;

    private RecommendationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RecommendationService();
    }

    /** @test */
    public function it_can_generate_recommendations_for_user()
    {
        // Criar usuário com preferências
        $user = User::factory()->create();
        UserPreference::create([
            'user_id' => $user->id,
            'systems' => ['D&D 5e', 'Pathfinder'],
            'styles' => ['Fantasia', 'Aventura'],
            'dynamics' => ['Roleplay', 'Combate']
        ]);

        // Criar campanhas
        $campaign1 = Campaign::factory()->create([
            'system' => 'D&D 5e',
            'status' => 'active',
            'visibility' => 'public'
        ]);

        $campaign2 = Campaign::factory()->create([
            'system' => 'Call of Cthulhu',
            'status' => 'active',
            'visibility' => 'public'
        ]);

        // Criar tags e associar
        $fantasyTag = Tag::create(['name' => 'Fantasia', 'category' => 'style']);
        $adventureTag = Tag::create(['name' => 'Aventura', 'category' => 'style']);
        
        $campaign1->tags()->attach($fantasyTag->id);
        $campaign1->tags()->attach($adventureTag->id);

        // Gerar recomendações
        $recommendations = $this->service->generateRecommendations($user->id, 5);

        $this->assertIsArray($recommendations);
        $this->assertNotEmpty($recommendations);
        
        // Verificar se a campanha com sistema preferido tem score maior
        $dndRecommendation = collect($recommendations)->firstWhere('target_id', $campaign1->id);
        $cthulhuRecommendation = collect($recommendations)->firstWhere('target_id', $campaign2->id);
        
        if ($dndRecommendation && $cthulhuRecommendation) {
            $this->assertGreaterThan($cthulhuRecommendation['score'], $dndRecommendation['score']);
        }
    }

    /** @test */
    public function it_respects_user_filters()
    {
        $user = User::factory()->create();
        
        // Criar filtros de usuário
        UserFilter::create([
            'user_id' => $user->id,
            'whitelist_tags' => [1, 2], // Apenas tags 1 e 2
            'blacklist_tags' => [3] // Excluir tag 3
        ]);

        // Criar tags
        $tag1 = Tag::create(['name' => 'Fantasia', 'category' => 'style']);
        $tag2 = Tag::create(['name' => 'Aventura', 'category' => 'style']);
        $tag3 = Tag::create(['name' => 'Terror', 'category' => 'style']);

        // Criar campanhas
        $allowedCampaign = Campaign::factory()->create(['status' => 'active', 'visibility' => 'public']);
        $allowedCampaign->tags()->attach([$tag1->id, $tag2->id]);

        $blockedCampaign = Campaign::factory()->create(['status' => 'active', 'visibility' => 'public']);
        $blockedCampaign->tags()->attach($tag3->id);

        $recommendations = $this->service->generateRecommendations($user->id, 10);

        // Verificar que apenas campanhas permitidas estão nas recomendações
        $recommendedIds = collect($recommendations)->pluck('target_id')->toArray();
        
        $this->assertContains($allowedCampaign->id, $recommendedIds);
        $this->assertNotContains($blockedCampaign->id, $recommendedIds);
    }

    /** @test */
    public function it_calculates_score_correctly()
    {
        $user = User::factory()->create();
        
        UserPreference::create([
            'user_id' => $user->id,
            'systems' => ['D&D 5e'],
            'styles' => ['Fantasia'],
            'dynamics' => ['Roleplay']
        ]);

        $campaign = Campaign::factory()->create([
            'system' => 'D&D 5e',
            'status' => 'active',
            'visibility' => 'public'
        ]);

        $fantasyTag = Tag::create(['name' => 'Fantasia', 'category' => 'style']);
        $campaign->tags()->attach($fantasyTag->id);

        $recommendations = $this->service->generateRecommendations($user->id, 1);
        
        $this->assertCount(1, $recommendations);
        $this->assertGreaterThan(0.5, $recommendations[0]['score']); // Score alto devido às preferências
    }

    /** @test */
    public function it_saves_recommendations_to_database()
    {
        $user = User::factory()->create();
        
        $campaign = Campaign::factory()->create([
            'status' => 'active',
            'visibility' => 'public'
        ]);

        $recommendations = [
            [
                'target_type' => 'campaign',
                'target_id' => $campaign->id,
                'score' => 0.8,
                'reason' => 'Teste de recomendação'
            ]
        ];

        $this->service->saveRecommendations($user->id, $recommendations);

        $this->assertDatabaseHas('recommendations', [
            'user_id' => $user->id,
            'target_type' => 'campaign',
            'target_id' => $campaign->id,
            'score' => 0.8
        ]);
    }

    /** @test */
    public function it_clears_user_cache()
    {
        $user = User::factory()->create();
        $cacheKey = "recommendations:user:{$user->id}";
        
        // Adicionar algo ao cache
        Cache::put($cacheKey, ['test' => 'data'], 3600);
        $this->assertTrue(Cache::has($cacheKey));
        
        // Limpar cache
        $this->service->clearUserCache($user->id);
        
        $this->assertFalse(Cache::has($cacheKey));
    }

    /** @test */
    public function it_handles_empty_recommendations()
    {
        $user = User::factory()->create();
        
        // Usuário sem preferências deve retornar array vazio ou com score baixo
        $recommendations = $this->service->generateRecommendations($user->id, 5);
        
        $this->assertIsArray($recommendations);
        // Pode estar vazio ou com scores baixos
    }

    /** @test */
    public function it_excludes_user_own_content()
    {
        $user = User::factory()->create();
        
        // Criar post do próprio usuário
        $userPost = Post::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public'
        ]);

        // Criar post de outro usuário
        $otherUser = User::factory()->create();
        $otherPost = Post::factory()->create([
            'author_id' => $otherUser->id,
            'visibility' => 'public'
        ]);

        $recommendations = $this->service->generateRecommendations($user->id, 10);
        $recommendedIds = collect($recommendations)->pluck('target_id')->toArray();
        
        $this->assertNotContains($userPost->id, $recommendedIds);
        $this->assertContains($otherPost->id, $recommendedIds);
    }
}
