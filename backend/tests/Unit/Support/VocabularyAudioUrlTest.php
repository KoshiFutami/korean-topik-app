<?php

declare(strict_types=1);

namespace Tests\Unit\Support;

use App\Support\VocabularyAudioUrl;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VocabularyAudioUrlTest extends TestCase
{
    public function test_returns_null_for_empty(): void
    {
        $this->assertNull(VocabularyAudioUrl::resolveForHttp(null));
        $this->assertNull(VocabularyAudioUrl::resolveForHttp(''));
    }

    public function test_passes_through_absolute_urls(): void
    {
        $u = 'https://cdn.example.com/a.mp3';

        $this->assertSame($u, VocabularyAudioUrl::resolveForHttp($u));
    }

    public function test_resolves_public_disk_relative_path(): void
    {
        Storage::fake('public');
        config(['app.url' => 'http://api.test']);

        $resolved = VocabularyAudioUrl::resolveForHttp('vocabulary-audio/01HZTEST.mp3');

        $this->assertStringStartsWith('http://api.test/storage/', $resolved);
        $this->assertStringContainsString('vocabulary-audio/01HZTEST.mp3', $resolved);
    }
}
