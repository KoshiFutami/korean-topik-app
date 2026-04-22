<?php

declare(strict_types=1);

namespace App\Application\User\Auth\GetMyProfile;

use DateTimeImmutable;

final class GetMyProfileOutput
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
