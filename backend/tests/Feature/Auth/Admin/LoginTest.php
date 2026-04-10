<?php

namespace Tests\Feature\Auth\Admin;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    public function test_login_returns_token_and_admin(): void
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-login@example.com',
            'password' => Hash::make('password123'),
        ]);

        $res = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['token', 'admin' => ['id', 'name', 'email']]);
    }

    public function test_login_invalid_credentials_returns_401(): void
    {
        Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-login2@example.com',
            'password' => Hash::make('password123'),
        ]);

        $res = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin-login2@example.com',
            'password' => 'wrong-password',
        ]);

        $res->assertStatus(401);
    }

    public function test_login_validation_error_returns_422(): void
    {
        $res = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'not-email',
            'password' => '',
        ]);

        $res->assertStatus(422);
    }
}
