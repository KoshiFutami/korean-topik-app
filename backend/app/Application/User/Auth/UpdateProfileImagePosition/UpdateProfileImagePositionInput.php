<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateProfileImagePosition;

final class UpdateProfileImagePositionInput
{
    public function __construct(
        public readonly string $userId,
        public readonly float $offsetX,
        public readonly float $offsetY,
    ) {}
}
