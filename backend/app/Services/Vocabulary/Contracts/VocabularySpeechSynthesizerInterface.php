<?php

declare(strict_types=1);

namespace App\Services\Vocabulary\Contracts;

interface VocabularySpeechSynthesizerInterface
{
    /**
     * 韓国語テキストを MP3 バイナリに変換する。
     *
     * @throws \Throwable Google API 等の失敗時
     */
    public function synthesizeKoreanToMp3(string $text): string;
}
