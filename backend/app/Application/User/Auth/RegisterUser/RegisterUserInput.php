<?php

declare(strict_types=1);

namespace App\Application\User\Auth\RegisterUser;

final class RegisterUserInput
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
    ) {}
}
