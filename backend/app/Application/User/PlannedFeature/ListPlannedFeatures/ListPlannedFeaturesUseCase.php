<?php

declare(strict_types=1);

namespace App\Application\User\PlannedFeature\ListPlannedFeatures;

use App\Domain\PlannedFeature\Repository\PlannedFeatureRepositoryInterface;

final class ListPlannedFeaturesUseCase
{
    public function __construct(private readonly PlannedFeatureRepositoryInterface $plannedFeatures) {}

    public function execute(ListPlannedFeaturesInput $input): ListPlannedFeaturesOutput
    {
        $items = $this->plannedFeatures->listPublishedOrdered();

        return new ListPlannedFeaturesOutput(
            plannedFeatures: array_map(
                static fn ($f) => ListPlannedFeaturesPlannedFeature::fromDomain($f),
                $items,
            ),
        );
    }
}
