<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\Post;
use Illuminate\Console\Command;

class IndexModelsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scout:index-models {--model= : Model to index (campaign, post, or all)} {--chunk=500 : Number of records to process at once}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Index Campaign and Post models to Scout search engine';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->option('model');
        $chunk = (int) $this->option('chunk');

        if (!$model || $model === 'all') {
            $this->indexCampaigns($chunk);
            $this->indexPosts($chunk);
        } elseif ($model === 'campaign') {
            $this->indexCampaigns($chunk);
        } elseif ($model === 'post') {
            $this->indexPosts($chunk);
        } else {
            $this->error('Invalid model option. Use: campaign, post, or all');
            return 1;
        }

        $this->info('Indexing completed successfully!');
        return 0;
    }

    /**
     * Index Campaign models
     */
    private function indexCampaigns(int $chunk): void
    {
        $this->info('Starting Campaign indexing...');
        
        $total = Campaign::count();
        $this->info("Total Campaigns to index: {$total}");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        Campaign::chunk($chunk, function ($campaigns) use ($bar) {
            foreach ($campaigns as $campaign) {
                if ($campaign->shouldBeSearchable()) {
                    $campaign->searchable();
                } else {
                    $campaign->unsearchable();
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Campaign indexing completed!');
    }

    /**
     * Index Post models
     */
    private function indexPosts(int $chunk): void
    {
        $this->info('Starting Post indexing...');
        
        $total = Post::count();
        $this->info("Total Posts to index: {$total}");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        Post::chunk($chunk, function ($posts) use ($bar) {
            foreach ($posts as $post) {
                if ($post->shouldBeSearchable()) {
                    $post->searchable();
                } else {
                    $post->unsearchable();
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Post indexing completed!');
    }
}
