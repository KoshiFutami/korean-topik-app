<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MeTest extends TestCase
{
    public function test_me_returns_user_for_authenticated_request(): void
    {
        $user = User::query()->create([
            'name' => 'Test',
            'email' => 'me@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['user' => ['id', 'name', 'email', 'created_at']]);
        $this->assertArrayNotHasKey('password', $res->json('user'));
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $res = $this->getJson('/api/v1/auth/me');
        $res->assertStatus(401);
    }
}

