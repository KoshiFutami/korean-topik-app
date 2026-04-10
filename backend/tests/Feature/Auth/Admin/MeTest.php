<?php

namespace Tests\Feature\Auth\Admin;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MeTest extends TestCase
{
    public function test_me_returns_admin_for_authenticated_request(): void
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-me@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        $res = $this->getJson('/api/v1/admin/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['admin' => ['id', 'name', 'email', 'created_at']]);
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $res = $this->getJson('/api/v1/admin/auth/me');
        $res->assertStatus(401);
    }
}

