<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Services\Vocabulary\StubMp3VocabularySpeechSynthesizer;
use PHPUnit\Framework\TestCase;

class StubMp3VocabularySpeechSynthesizerTest extends TestCase
{
    public function test_returns_non_empty_mp3_bytes(): void
    {
        $synth = new StubMp3VocabularySpeechSynthesizer;
        $out = $synth->synthesizeKoreanToMp3('테스트');

        $this->assertNotSame('', $out);
        $this->assertStringStartsWith('ID3', $out);
        $this->assertGreaterThan(1000, strlen($out), '開発用スタブは再生時間が分かる程度の長さの MP3 を返す');
    }
}
