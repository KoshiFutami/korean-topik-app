<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NicknameTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_with_nickname_returns_201(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'テストユーザー',
            'nickname' => 'テストくん',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['nickname' => 'テストくん']);

        $this->assertDatabaseHas('users', ['nickname' => 'テストくん']);
    }

    public function test_register_without_nickname_returns_201(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'nickname' => null]);
    }

    public function test_login_returns_token(): void
    {
        $user = User::factory()->create([
            'nickname' => 'ログインくん',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['nickname' => 'ログインくん'])
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_get_user_returns_nickname(): void
    {
        $user = User::factory()->create(['nickname' => 'マイニックネーム']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/user');

        $response->assertStatus(200)
            ->assertJsonFragment(['nickname' => 'マイニックネーム']);
    }

    public function test_update_nickname_succeeds(): void
    {
        $user = User::factory()->create(['nickname' => '旧ニックネーム']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->patchJson('/api/v1/user/nickname', [
            'nickname' => '新ニックネーム',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['nickname' => '新ニックネーム']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'nickname' => '新ニックネーム']);
    }

    public function test_update_nickname_requires_auth(): void
    {
        $response = $this->patchJson('/api/v1/user/nickname', [
            'nickname' => 'ニックネーム',
        ]);

        $response->assertStatus(401);
    }

    public function test_update_nickname_validates_max_length(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->patchJson('/api/v1/user/nickname', [
            'nickname' => str_repeat('あ', 51),
        ]);

        $response->assertStatus(422);
    }

    public function test_logout_invalidates_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/auth/logout')
            ->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
