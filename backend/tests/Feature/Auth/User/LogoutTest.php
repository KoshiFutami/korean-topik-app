<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    public function test_logout_revokes_current_token(): void
    {
        $user = User::query()->create([
            'name' => 'Test',
            'email' => 'logout@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->postJson('/api/v1/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);
        $res->assertOk();

        $res2 = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);
        $res2->assertStatus(401);
    }

    public function test_logout_returns_401_when_unauthenticated(): void
    {
        $res = $this->postJson('/api/v1/auth/logout');
        $res->assertStatus(401);
    }
}

