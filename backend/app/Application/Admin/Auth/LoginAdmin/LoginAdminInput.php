<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\LoginAdmin;

final class LoginAdminInput
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
    ) {}
}
