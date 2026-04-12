<?php

declare(strict_types=1);

namespace App\Application\User\Auth\LogoutUser;

final class LogoutUserInput
{
    public function __construct(public readonly string $userId) {}
}
