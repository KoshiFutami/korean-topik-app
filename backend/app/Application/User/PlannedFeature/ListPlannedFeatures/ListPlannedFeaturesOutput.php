<?php

declare(strict_types=1);

namespace App\Application\User\PlannedFeature\ListPlannedFeatures;

final class ListPlannedFeaturesOutput
{
    /**
     * @param  list<ListPlannedFeaturesPlannedFeature>  $plannedFeatures
     */
    public function __construct(
        public readonly array $plannedFeatures,
    ) {}
}
