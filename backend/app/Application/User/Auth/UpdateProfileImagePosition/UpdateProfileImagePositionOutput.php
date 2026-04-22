<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateProfileImagePosition;

final class UpdateProfileImagePositionOutput
{
    public function __construct(
        public readonly float $profileImageOffsetX,
        public readonly float $profileImageOffsetY,
    ) {}
}
