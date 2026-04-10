<?php

namespace Tests\Feature\Vocabulary\Admin;

use App\Models\Admin;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VocabularyCrudTest extends TestCase
{
    private function authHeader(): array
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-vocab@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_index_returns_vocabularies_for_authenticated_admin(): void
    {
        Vocabulary::query()->create([
            'term' => '먹다',
            'meaning_ja' => '食べる',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $res = $this->getJson('/api/v1/admin/vocabularies', $this->authHeader());

        $res->assertOk();
        $res->assertJsonStructure(['vocabularies' => [['id', 'term', 'meaning_ja', 'pos', 'level', 'entry_type', 'status', 'created_at']]]);
    }

    public function test_store_creates_vocabulary(): void
    {
        $res = $this->postJson('/api/v1/admin/vocabularies', [
            'term' => '마시다',
            'meaning_ja' => '飲む',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'example_sentence' => '물을 마셔요.',
            'example_translation_ja' => '水を飲みます。',
            'status' => 'published',
        ], $this->authHeader());

        $res->assertCreated();
        $res->assertJsonStructure(['vocabulary' => ['id', 'term', 'meaning_ja', 'pos', 'level', 'entry_type', 'status', 'created_at']]);
    }

    public function test_show_returns_vocabulary(): void
    {
        $v = Vocabulary::query()->create([
            'term' => '공부하다',
            'meaning_ja' => '勉強する',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $res = $this->getJson("/api/v1/admin/vocabularies/{$v->id}", $this->authHeader());

        $res->assertOk();
        $res->assertJsonStructure(['vocabulary' => ['id', 'term', 'meaning_ja', 'pos', 'level', 'entry_type', 'status', 'created_at']]);
    }

    public function test_update_updates_vocabulary(): void
    {
        $v = Vocabulary::query()->create([
            'term' => '가다',
            'meaning_ja' => '行く',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $res = $this->putJson("/api/v1/admin/vocabularies/{$v->id}", [
            'term' => '가다',
            'meaning_ja' => '行く（移動する）',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ], $this->authHeader());

        $res->assertOk();
        $this->assertSame('行く（移動する）', $res->json('vocabulary.meaning_ja'));
    }

    public function test_destroy_deletes_vocabulary(): void
    {
        $v = Vocabulary::query()->create([
            'term' => '오다',
            'meaning_ja' => '来る',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $res = $this->deleteJson("/api/v1/admin/vocabularies/{$v->id}", [], $this->authHeader());

        $res->assertNoContent();
    }

    public function test_unauthenticated_returns_401(): void
    {
        $res = $this->getJson('/api/v1/admin/vocabularies');
        $res->assertStatus(401);
    }
}
