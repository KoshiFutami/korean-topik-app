<?php

declare(strict_types=1);

namespace App\Infrastructure\Admin\Token;

use App\Application\Shared\Port\TokenServiceInterface;
use App\Models\Admin;
use Laravel\Sanctum\PersonalAccessToken;

final class SanctumAdminTokenService implements TokenServiceInterface
{
    public function createToken(string $id, string $name): string
    {
        $admin = Admin::query()->findOrFail($id);

        return $admin->createToken($name)->plainTextToken;
    }

    public function revokeCurrentToken(): void
    {
        $admin = request()->user('admin');
        if (! $admin instanceof Admin) {
            return;
        }

        $token = $admin->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();

            return;
        }

        $admin->tokens()->delete();
    }
}
