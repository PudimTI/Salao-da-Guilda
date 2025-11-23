<?php

return [
    'targets' => [
        'user' => App\Models\User::class,
        'post' => App\Models\Post::class,
        'comment' => App\Models\Comment::class,
        'campaign' => App\Models\Campaign::class,
    ],

    'status_labels' => [
        App\Models\Report::STATUS_OPEN => 'Aberta',
        App\Models\Report::STATUS_UNDER_REVIEW => 'Em análise',
        App\Models\Report::STATUS_RESOLVED => 'Resolvida',
        App\Models\Report::STATUS_DISMISSED => 'Arquivada',
    ],

    'reason_min_length' => 15,
];









