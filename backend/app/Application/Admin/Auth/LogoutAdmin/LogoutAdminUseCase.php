<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\LogoutAdmin;

use App\Application\Shared\Port\TokenServiceInterface;

final class LogoutAdminUseCase
{
    public function __construct(private readonly TokenServiceInterface $tokens) {}

    public function execute(LogoutAdminInput $input): void
    {
        $this->tokens->revokeCurrentToken();
    }
}
