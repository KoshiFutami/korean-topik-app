<?php

namespace Tests\Feature\Vocabulary\User;

use App\Models\User;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VocabularyApiTest extends TestCase
{
    private function authHeader(): array
    {
        $user = User::query()->create([
            'name' => 'Taro',
            'email' => 'user-vocab@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('user')->plainTextToken;

        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    public function test_index_returns_only_published_vocabularies(): void
    {
        Vocabulary::query()->create([
            'term' => '먹다',
            'meaning_ja' => '食べる',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        Vocabulary::query()->create([
            'term' => '숨기다',
            'meaning_ja' => '隠す',
            'pos' => 'verb',
            'level' => 3,
            'entry_type' => 'word',
            'status' => 'draft',
        ]);

        $res = $this->getJson('/api/v1/vocabularies', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertCount(1, $res->json('vocabularies'));
        $res->assertJsonStructure([
            'vocabularies' => [[
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
                'audio_url',
                'example_audio_url',
            ]],
        ]);
    }

    public function test_index_supports_filters(): void
    {
        Vocabulary::query()->create([
            'term' => '먹다',
            'meaning_ja' => '食べる',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        Vocabulary::query()->create([
            'term' => '눈이 높다',
            'meaning_ja' => '目が肥えている',
            'pos' => 'adj',
            'level' => 5,
            'entry_type' => 'idiom',
            'status' => 'published',
        ]);

        $res = $this->getJson('/api/v1/vocabularies?level=5&entry_type=idiom&pos=adj', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertCount(1, $res->json('vocabularies'));
        $this->assertSame('눈이 높다', $res->json('vocabularies.0.term'));
    }

    public function test_show_returns_404_for_non_published(): void
    {
        $v = Vocabulary::query()->create([
            'term' => '숨기다',
            'meaning_ja' => '隠す',
            'pos' => 'verb',
            'level' => 3,
            'entry_type' => 'word',
            'status' => 'draft',
        ]);

        $res = $this->getJson("/api/v1/vocabularies/{$v->id}", ['Accept' => 'application/json']);
        $res->assertNotFound();
    }

    public function test_index_allows_guest_access(): void
    {
        Vocabulary::query()->create([
            'term' => '먹다',
            'meaning_ja' => '食べる',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $res = $this->getJson('/api/v1/vocabularies', ['Accept' => 'application/json']);
        $res->assertOk();
    }
}
