<?php

namespace Tests\Feature\Auth\User;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadProfileImageTest extends TestCase
{
    public function test_upload_profile_image_returns_url(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $res = $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file,
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['profile_image_url']);
        $this->assertNotNull($res->json('profile_image_url'));
    }

    public function test_upload_profile_image_updates_user_profile_image_path(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;
        $file = UploadedFile::fake()->image('avatar.png', 200, 200);

        $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file,
        ], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $this->assertNotNull($user->fresh()->profile_image_path);
    }

    public function test_upload_profile_image_returns_image_url_in_me_response(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file,
        ], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $res = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonStructure(['user' => ['profile_image_url']]);
        $this->assertNotNull($res->json('user.profile_image_url'));
    }

    public function test_upload_profile_image_replaces_old_image(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $file1 = UploadedFile::fake()->image('first.jpg', 100, 100);
        $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file1,
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        $firstPath = $user->fresh()->profile_image_path;

        $file2 = UploadedFile::fake()->image('second.jpg', 100, 100);
        $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file2,
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        $secondPath = $user->fresh()->profile_image_path;

        $this->assertNotEquals($firstPath, $secondPath);
        $this->assertNotNull($secondPath);
    }

    public function test_upload_profile_image_returns_401_when_unauthenticated(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $res = $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file,
        ]);

        $res->assertStatus(401);
    }

    public function test_upload_profile_image_returns_422_for_non_image_file(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $res = $this->postJson('/api/v1/auth/me/profile-image', [
            'image' => $file,
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertStatus(422);
    }

    public function test_upload_profile_image_returns_422_when_no_file_provided(): void
    {
        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->postJson('/api/v1/auth/me/profile-image', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertStatus(422);
    }

    public function test_me_returns_null_profile_image_url_when_not_set(): void
    {
        $user = User::query()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        $res = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJsonPath('user.profile_image_url', null);
    }
}
