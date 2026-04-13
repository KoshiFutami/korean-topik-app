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

    public function test_resolves_gcs_public_url_when_url_method_is_unavailable(): void
    {
        // Simulate production config where AUDIO_STORAGE_DISK=audio_gcs
        config([
            'filesystems.audio_disk' => 'audio_gcs',
            'filesystems.disks.audio_gcs.driver' => 'gcs',
            'filesystems.disks.audio_gcs.bucket' => 'korean-topik-app-prod-audio-file',
            'filesystems.disks.audio_gcs.path_prefix' => '',
        ]);

        $resolved = VocabularyAudioUrl::resolveForHttp('vocabulary-audio/01HZTEST.mp3');

        $this->assertSame(
            'https://storage.googleapis.com/korean-topik-app-prod-audio-file/vocabulary-audio/01HZTEST.mp3',
            $resolved
        );
    }
}
