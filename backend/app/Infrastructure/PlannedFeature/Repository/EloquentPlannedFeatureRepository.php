<?php

declare(strict_types=1);

namespace App\Infrastructure\PlannedFeature\Repository;

use App\Domain\PlannedFeature\Entity\PlannedFeature;
use App\Domain\PlannedFeature\Repository\PlannedFeatureRepositoryInterface;
use App\Models\PlannedFeature as EloquentPlannedFeature;

final class EloquentPlannedFeatureRepository implements PlannedFeatureRepositoryInterface
{
    public function listPublishedOrdered(): array
    {
        return EloquentPlannedFeature::query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(static fn (EloquentPlannedFeature $m): PlannedFeature => PlannedFeatureMapper::toDomain($m))
            ->all();
    }
}
