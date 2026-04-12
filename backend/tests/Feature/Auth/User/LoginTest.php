<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    public function test_login_returns_token_and_user(): void
    {
        $user = User::query()->create([
            'name' => 'Test',
            'email' => 'test-login@example.com',
            'password' => Hash::make('password123'),
        ]);

        $res = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_login_invalid_credentials_returns_401(): void
    {
        User::query()->create([
            'name' => 'Test',
            'email' => 'test-login2@example.com',
            'password' => Hash::make('password123'),
        ]);

        $res = $this->postJson('/api/v1/auth/login', [
            'email' => 'test-login2@example.com',
            'password' => 'wrong-password',
        ]);

        $res->assertStatus(401);
    }

    public function test_login_validation_error_returns_422(): void
    {
        $res = $this->postJson('/api/v1/auth/login', [
            'email' => 'not-email',
            'password' => '',
        ]);

        $res->assertStatus(422);
    }
}
