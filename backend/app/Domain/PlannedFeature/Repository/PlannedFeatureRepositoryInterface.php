<?php

declare(strict_types=1);

namespace App\Domain\PlannedFeature\Repository;

use App\Domain\PlannedFeature\Entity\PlannedFeature;

interface PlannedFeatureRepositoryInterface
{
    /**
     * @return list<PlannedFeature>
     */
    public function listPublishedOrdered(): array;
}
