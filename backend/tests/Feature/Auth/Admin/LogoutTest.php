<?php

namespace Tests\Feature\Auth\Admin;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    public function test_logout_revokes_current_token(): void
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-logout@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        $res = $this->postJson('/api/v1/admin/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);
        $res->assertOk();

        $res2 = $this->getJson('/api/v1/admin/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);
        $res2->assertStatus(401);
    }

    public function test_logout_returns_401_when_unauthenticated(): void
    {
        $res = $this->postJson('/api/v1/admin/auth/logout');
        $res->assertStatus(401);
    }
}
