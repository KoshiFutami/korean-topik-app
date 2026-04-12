<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

use App\Models\Vocabulary;

/**
 * 語彙1件分の合成用テキストを組み立てる。
 */
final class VocabularyTtsSourceText
{
    /**
     * @param  bool  $includeExample  true のとき例文を句点の後に連結（1リクエストで合成）
     */
    public static function build(Vocabulary $vocabulary, bool $includeExample): string
    {
        $term = VocabularyTtsTextSanitizer::forSpeech((string) $vocabulary->term);
        if ($term === '') {
            return '';
        }

        if (! $includeExample) {
            return $term;
        }

        $example = $vocabulary->example_sentence
            ? VocabularyTtsTextSanitizer::forSpeech((string) $vocabulary->example_sentence)
            : '';

        if ($example === '') {
            return $term;
        }

        return $term.'。 '.$example;
    }

    /**
     * 例文のみを合成用テキストとして返す（見出し語は含めない）。
     */
    public static function exampleOnly(Vocabulary $vocabulary): string
    {
        $raw = $vocabulary->example_sentence;
        if ($raw === null || trim((string) $raw) === '') {
            return '';
        }

        return VocabularyTtsTextSanitizer::forSpeech((string) $raw);
    }
}
