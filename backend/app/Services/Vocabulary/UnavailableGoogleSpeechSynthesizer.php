<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use RuntimeException;

/**
 * google/cloud-text-to-speech が vendor に無い環境向けのスタブ。
 */
final class UnavailableGoogleSpeechSynthesizer implements VocabularySpeechSynthesizerInterface
{
    public function synthesizeKoreanToMp3(string $_text): string
    {
        throw new RuntimeException(
            'google/cloud-text-to-speech が読み込めません。backend で composer install を実行するか、'
            .'Docker 利用時は `make composer-backend`（コンテナ内 composer install）で vendor を同期してください。',
        );
    }
}
