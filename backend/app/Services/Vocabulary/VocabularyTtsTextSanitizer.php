<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

/**
 * TTS に渡す前に、表示用の強調記号などを除去する。
 */
final class VocabularyTtsTextSanitizer
{
    /**
     * 強調用の角括弧（U+2039, U+203A）および一般的な引用符を取り除き、空白を正規化する。
     */
    public static function forSpeech(string $text): string
    {
        $replacements = [
            "\u{2039}" => '',
            "\u{203A}" => '',
            "\u{00AB}" => '',
            "\u{00BB}" => '',
        ];
        $clean = strtr($text, $replacements);
        $clean = preg_replace('/\s+/u', ' ', $clean) ?? $clean;

        return trim($clean);
    }
}
