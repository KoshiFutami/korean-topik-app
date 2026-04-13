<?php

declare(strict_types=1);

namespace Tests\Feature\Vocabulary\User;

use App\Models\Admin;
use App\Models\Vocabulary;
use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VocabularyEnsureAudioApiTest extends TestCase
{
    /** 実 MP3 より短いバイナリは「旧スタブ」扱いで再合成されるため、テスト用は十分な長さにする */
    private function fakeMp3Payload(): string
    {
        return str_repeat('M', 2048);
    }

    public function test_post_audio_synthesizes_once_then_uses_cache(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '물',
            'meaning_ja' => '水',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
            'audio_url' => null,
        ]);

        $res1 = $this->postJson("/api/v1/vocabularies/{$v->id}/audio");
        $res1->assertOk();
        $res1->assertJsonStructure(['audio_url']);
        $this->assertIsString($res1->json('audio_url'));

        $v->refresh();
        $this->assertNotNull($v->audio_url);

        $res2 = $this->postJson("/api/v1/vocabularies/{$v->id}/audio");
        $res2->assertOk();
        $this->assertSame($res1->json('audio_url'), $res2->json('audio_url'));
    }

    public function test_post_audio_regenerates_when_db_path_has_no_file_on_disk(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '길',
            'meaning_ja' => '道',
            'pos' => 'noun',
            'level' => 2,
            'entry_type' => 'word',
            'status' => 'published',
            'audio_url' => null,
        ]);

        $missingPath = 'vocabulary-audio/'.$v->id.'.mp3';
        $v->forceFill(['audio_url' => $missingPath])->save();
        Storage::disk('public')->assertMissing($missingPath);

        $res = $this->postJson("/api/v1/vocabularies/{$v->id}/audio");
        $res->assertOk();
        Storage::disk('public')->assertExists($missingPath);
        $this->assertSame($payload, Storage::disk('public')->get($missingPath));
    }

    public function test_post_audio_regenerates_when_cached_file_is_trivially_small(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '문',
            'meaning_ja' => '門',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
            'audio_url' => null,
        ]);

        $path = 'vocabulary-audio/'.$v->id.'.mp3';
        $v->forceFill(['audio_url' => $path])->save();
        Storage::disk('public')->put($path, str_repeat('0', 400));

        $this->postJson("/api/v1/vocabularies/{$v->id}/audio")->assertOk();
        $this->assertSame($payload, Storage::disk('public')->get($path));
    }

    public function test_post_audio_returns_404_for_draft_when_public(): void
    {
        Storage::fake('public');

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->never();
        });

        $v = Vocabulary::query()->create([
            'term' => '숨기다',
            'meaning_ja' => '隠す',
            'pos' => 'verb',
            'level' => 3,
            'entry_type' => 'word',
            'status' => 'draft',
            'audio_url' => null,
        ]);

        $this->postJson("/api/v1/vocabularies/{$v->id}/audio")->assertNotFound();
    }

    private function adminAuthHeader(): array
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-ensure-audio@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    public function test_admin_post_audio_can_generate_for_draft(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '책',
            'meaning_ja' => '本',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'draft',
            'audio_url' => null,
        ]);

        $res = $this->postJson("/api/v1/admin/vocabularies/{$v->id}/audio", [], $this->adminAuthHeader());
        $res->assertOk();
        $res->assertJsonStructure(['audio_url']);
    }

    public function test_post_example_audio_synthesizes_once_then_uses_cache(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '물',
            'meaning_ja' => '水',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
            'example_sentence' => '물을 마셔요.',
            'example_audio_url' => null,
        ]);

        $res1 = $this->postJson("/api/v1/vocabularies/{$v->id}/audio/example");
        $res1->assertOk();
        $res1->assertJsonStructure(['example_audio_url']);

        $v->refresh();
        $this->assertNotNull($v->example_audio_url);

        $res2 = $this->postJson("/api/v1/vocabularies/{$v->id}/audio/example");
        $res2->assertOk();
        $this->assertSame($res1->json('example_audio_url'), $res2->json('example_audio_url'));
    }

    public function test_post_example_audio_returns_422_when_example_missing(): void
    {
        Storage::fake('public');

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->never();
        });

        $v = Vocabulary::query()->create([
            'term' => '물',
            'meaning_ja' => '水',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
            'example_sentence' => null,
            'example_audio_url' => null,
        ]);

        $this->postJson("/api/v1/vocabularies/{$v->id}/audio/example")->assertStatus(422);
    }

    public function test_post_example_audio_returns_404_for_draft_when_public(): void
    {
        Storage::fake('public');

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->never();
        });

        $v = Vocabulary::query()->create([
            'term' => '물',
            'meaning_ja' => '水',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'draft',
            'example_sentence' => '물을 마셔요.',
            'example_audio_url' => null,
        ]);

        $this->postJson("/api/v1/vocabularies/{$v->id}/audio/example")->assertNotFound();
    }

    public function test_admin_post_example_audio_can_generate_for_draft(): void
    {
        Storage::fake('public');

        $payload = $this->fakeMp3Payload();

        $this->mock(VocabularySpeechSynthesizerInterface::class, function ($mock) use ($payload): void {
            $mock->shouldReceive('synthesizeKoreanToMp3')->once()->andReturn($payload);
        });

        $v = Vocabulary::query()->create([
            'term' => '책',
            'meaning_ja' => '本',
            'pos' => 'noun',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'draft',
            'example_sentence' => '책을 읽어요.',
            'example_audio_url' => null,
        ]);

        $res = $this->postJson("/api/v1/admin/vocabularies/{$v->id}/audio/example", [], $this->adminAuthHeader());
        $res->assertOk();
        $res->assertJsonStructure(['example_audio_url']);
    }
}
