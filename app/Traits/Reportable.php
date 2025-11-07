<?php

namespace App\Traits;

use App\Models\Report;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Reportable
{
    public function reports(): MorphMany
    {
        return $this->morphMany(Report::class, 'target');
    }

    public function unresolvedReports(): MorphMany
    {
        return $this->reports()->whereNotIn('status', [Report::STATUS_RESOLVED, Report::STATUS_DISMISSED]);
    }
}


