<?php

declare(strict_types=1);

namespace App\Application\User\Auth\LogoutUser;

use App\Application\Shared\Port\TokenServiceInterface;

final class LogoutUserUseCase
{
    public function __construct(private readonly TokenServiceInterface $tokens) {}

    public function execute(LogoutUserInput $input): void
    {
        $this->tokens->revokeCurrentToken();
    }
}
