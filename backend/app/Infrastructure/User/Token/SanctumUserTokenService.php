<?php

declare(strict_types=1);

namespace App\Infrastructure\User\Token;

use App\Application\Shared\Port\TokenServiceInterface;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

final class SanctumUserTokenService implements TokenServiceInterface
{
    public function createToken(string $id, string $name): string
    {
        $user = User::query()->findOrFail($id);

        return $user->createToken($name)->plainTextToken;
    }

    public function revokeCurrentToken(): void
    {
        $user = request()->user();
        if (! $user instanceof User) {
            return;
        }

        $token = $user->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();

            return;
        }

        // Fallback: if token can't be resolved, revoke all tokens.
        $user->tokens()->delete();
    }
}

