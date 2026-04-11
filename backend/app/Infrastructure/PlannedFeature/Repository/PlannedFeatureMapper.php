<?php

declare(strict_types=1);

namespace App\Infrastructure\PlannedFeature\Repository;

use App\Domain\PlannedFeature\Entity\PlannedFeature;
use App\Domain\PlannedFeature\ValueObject\PlannedFeatureId;
use App\Models\PlannedFeature as EloquentPlannedFeature;
use DateTimeImmutable;

final class PlannedFeatureMapper
{
    public static function toDomain(EloquentPlannedFeature $m): PlannedFeature
    {
        return PlannedFeature::reconstruct(
            id: PlannedFeatureId::fromString($m->id),
            titleJa: $m->title_ja,
            summaryJa: $m->summary_ja,
            subtitleKo: $m->subtitle_ko,
            sortOrder: (int) $m->sort_order,
            isPublished: (bool) $m->is_published,
            createdAt: $m->created_at !== null
                ? DateTimeImmutable::createFromInterface($m->created_at)
                : new DateTimeImmutable('@0'),
        );
    }
}
