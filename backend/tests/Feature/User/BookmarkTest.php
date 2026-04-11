<?php

namespace Tests\Feature\User;

use App\Models\Bookmark;
use App\Models\User;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BookmarkTest extends TestCase
{
    private function createUser(string $email = 'bookmark-user@example.com'): User
    {
        return User::query()->create([
            'name' => 'Taro',
            'email' => $email,
            'password' => Hash::make('password123'),
        ]);
    }

    private function authHeader(User $user): array
    {
        $token = $user->createToken('user')->plainTextToken;

        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    private function createPublishedVocabulary(string $term = '먹다'): Vocabulary
    {
        return Vocabulary::query()->create([
            'term' => $term,
            'meaning_ja' => '食べる',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);
    }

    public function test_index_returns_200_with_bookmarked_vocabularies(): void
    {
        $user = $this->createUser();
        $vocabulary = $this->createPublishedVocabulary();

        Bookmark::query()->create([
            'user_id' => $user->id,
            'vocabulary_id' => $vocabulary->id,
        ]);

        $res = $this->getJson('/api/v1/bookmarks', $this->authHeader($user));

        $res->assertOk();
        $this->assertCount(1, $res->json('bookmarks'));
        $res->assertJsonStructure([
            'bookmarks' => [[
                'id',
                'term',
                'meaning_ja',
                'pos',
                'pos_label_ja',
                'level',
                'level_label_ja',
                'entry_type',
                'entry_type_label_ja',
                'example_sentence',
                'example_translation_ja',
                'bookmarked_at',
            ]],
        ]);
        $this->assertSame('먹다', $res->json('bookmarks.0.term'));
    }

    public function test_store_returns_201_on_success(): void
    {
        $user = $this->createUser();
        $vocabulary = $this->createPublishedVocabulary();

        $res = $this->postJson('/api/v1/bookmarks', [
            'vocabulary_id' => $vocabulary->id,
        ], $this->authHeader($user));

        $res->assertCreated();
        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $user->id,
            'vocabulary_id' => $vocabulary->id,
        ]);
    }

    public function test_store_returns_409_when_already_bookmarked(): void
    {
        $user = $this->createUser();
        $vocabulary = $this->createPublishedVocabulary();

        Bookmark::query()->create([
            'user_id' => $user->id,
            'vocabulary_id' => $vocabulary->id,
        ]);

        $res = $this->postJson('/api/v1/bookmarks', [
            'vocabulary_id' => $vocabulary->id,
        ], $this->authHeader($user));

        $res->assertStatus(409);
    }

    public function test_store_returns_404_for_nonexistent_vocabulary(): void
    {
        $user = $this->createUser();

        $res = $this->postJson('/api/v1/bookmarks', [
            'vocabulary_id' => '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        ], $this->authHeader($user));

        $res->assertNotFound();
    }

    public function test_destroy_returns_200_on_success(): void
    {
        $user = $this->createUser();
        $vocabulary = $this->createPublishedVocabulary();

        Bookmark::query()->create([
            'user_id' => $user->id,
            'vocabulary_id' => $vocabulary->id,
        ]);

        $res = $this->deleteJson("/api/v1/bookmarks/{$vocabulary->id}", [], $this->authHeader($user));

        $res->assertOk();
        $this->assertDatabaseMissing('bookmarks', [
            'user_id' => $user->id,
            'vocabulary_id' => $vocabulary->id,
        ]);
    }

    public function test_destroy_returns_404_when_not_bookmarked(): void
    {
        $user = $this->createUser();
        $vocabulary = $this->createPublishedVocabulary();

        $res = $this->deleteJson("/api/v1/bookmarks/{$vocabulary->id}", [], $this->authHeader($user));

        $res->assertNotFound();
    }

    public function test_unauthenticated_user_cannot_access_bookmarks(): void
    {
        $res = $this->getJson('/api/v1/bookmarks', ['Accept' => 'application/json']);
        $res->assertUnauthorized();
    }
}
