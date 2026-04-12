<?php

declare(strict_types=1);

namespace App\Application\User\PlannedFeature\ListPlannedFeatures;

use App\Domain\PlannedFeature\Entity\PlannedFeature;

final class ListPlannedFeaturesPlannedFeature
{
    public function __construct(
        public readonly string $id,
        public readonly string $titleJa,
        public readonly ?string $summaryJa,
        public readonly ?string $subtitleKo,
        public readonly int $sortOrder,
    ) {}

    public static function fromDomain(PlannedFeature $f): self
    {
        return new self(
            id: $f->id()->value(),
            titleJa: $f->titleJa(),
            summaryJa: $f->summaryJa(),
            subtitleKo: $f->subtitleKo(),
            sortOrder: $f->sortOrder(),
        );
    }
}
