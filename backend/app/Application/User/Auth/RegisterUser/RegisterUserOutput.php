<?php

declare(strict_types=1);

namespace App\Application\User\Auth\RegisterUser;

use DateTimeImmutable;

final class RegisterUserOutput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $name,
        public readonly ?string $nickname,
        public readonly string $email,
        public readonly string $token,
        public readonly DateTimeImmutable $createdAt,
    ) {}
}
