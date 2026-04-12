<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;

/**
 * Google TTS クレデンシャル未設定などのローカル開発用に、無音 MP3 を返す。
 *
 * 既定は `resources/audio/development-vocabulary-stub.mp3`（約 5 秒の無音。
 * 出典: https://github.com/anars/blank-audio ）。ファイルが無い場合のみ極短い埋め込みバイナリにフォールバックする。
 */
final class StubMp3VocabularySpeechSynthesizer implements VocabularySpeechSynthesizerInterface
{
    private const FALLBACK_SILENT_MP3_BASE64 = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkAAAAAAAAAGw9wrNaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

    public function synthesizeKoreanToMp3(string $_text): string
    {
        $path = dirname(__DIR__, 3).'/resources/audio/development-vocabulary-stub.mp3';
        if (is_readable($path)) {
            $binary = file_get_contents($path);
            if ($binary !== false && $binary !== '') {
                return $binary;
            }
        }

        $binary = base64_decode(self::FALLBACK_SILENT_MP3_BASE64, true);

        return $binary !== false ? $binary : '';
    }
}
