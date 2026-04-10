<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\GetMyProfile;

use DateTimeImmutable;

final class GetMyProfileOutput
{
    public function __construct(
        public readonly string $adminId,
        public readonly string $name,
        public readonly string $email,
        public readonly DateTimeImmutable $createdAt,
    ) {}
}
