<?php

declare(strict_types=1);

namespace App\Application\Shared\Port;

interface TokenServiceInterface
{
    public function createToken(string $id, string $name): string;

    public function revokeCurrentToken(): void;
}
