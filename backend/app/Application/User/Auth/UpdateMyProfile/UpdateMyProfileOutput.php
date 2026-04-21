<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateMyProfile;

use DateTimeImmutable;

final class UpdateMyProfileOutput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $name,
        public readonly ?string $nickname,
        public readonly string $email,
        public readonly DateTimeImmutable $createdAt,
        public readonly ?string $profileImageUrl = null,
    ) {}
}
