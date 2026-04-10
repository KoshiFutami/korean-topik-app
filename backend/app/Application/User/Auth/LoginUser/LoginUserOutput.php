<?php

declare(strict_types=1);

namespace App\Application\User\Auth\LoginUser;

final class LoginUserOutput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $name,
        public readonly string $email,
        public readonly string $token,
    ) {}
}
