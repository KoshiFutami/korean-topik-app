<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    public function test_register_returns_token_and_user(): void
    {
        $res = $this->postJson('/api/v1/auth/register', [
            'name' => 'Taro',
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $res->assertCreated();
        $res->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email', 'created_at'],
        ]);
        $this->assertArrayNotHasKey('password', $res->json('user'));
    }

    public function test_register_duplicate_email_returns_409(): void
    {
        User::query()->create([
            'name' => 'Exists',
            'email' => 'dup@example.com',
            'password' => Hash::make('password123'),
        ]);

        $res = $this->postJson('/api/v1/auth/register', [
            'name' => 'Taro',
            'email' => 'dup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $res->assertStatus(409);
    }

    public function test_register_validation_error_returns_422(): void
    {
        $res = $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $res->assertStatus(422);
    }
}

