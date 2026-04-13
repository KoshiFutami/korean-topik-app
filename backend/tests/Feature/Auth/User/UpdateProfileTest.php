<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdateProfileTest extends TestCase
{
    public function test_update_profile_changes_name_and_email(): void
    {
        $user = User::query()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonPath('user.name', 'Updated Name');
        $res->assertJsonPath('user.email', 'updated@example.com');
        $res->assertJsonStructure(['user' => ['id', 'name', 'email', 'created_at']]);
        $this->assertArrayNotHasKey('password', $res->json('user'));
    }

    public function test_update_profile_changes_password_with_valid_current_password(): void
    {
        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'current_password' => 'oldpassword',
            'new_password' => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonPath('user.name', 'Test User');

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_update_profile_returns_422_with_wrong_current_password(): void
    {
        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'current_password' => 'wrongpassword',
            'new_password' => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertStatus(422);
    }

    public function test_update_profile_returns_409_when_email_already_in_use(): void
    {
        User::query()->create([
            'name' => 'Another User',
            'email' => 'taken@example.com',
            'password' => Hash::make('password123'),
        ]);

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => 'Test User',
            'email' => 'taken@example.com',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertStatus(409);
    }

    public function test_update_profile_returns_401_when_unauthenticated(): void
    {
        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => 'Test',
            'email' => 'test@example.com',
        ]);

        $res->assertStatus(401);
    }

    public function test_update_profile_returns_422_for_invalid_data(): void
    {
        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'valid@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->patchJson('/api/v1/auth/me', [
            'name' => '',
            'email' => 'not-an-email',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertStatus(422);
    }
}
