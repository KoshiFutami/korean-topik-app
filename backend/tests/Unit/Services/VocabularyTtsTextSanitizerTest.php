<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Services\Vocabulary\VocabularyTtsTextSanitizer;
use PHPUnit\Framework\TestCase;

class VocabularyTtsTextSanitizerTest extends TestCase
{
    public function test_strips_single_angle_quotation_marks(): void
    {
        $input = "저는 \u{2039}밥\u{203A}을 먹어요.";
        $out = VocabularyTtsTextSanitizer::forSpeech($input);

        $this->assertSame('저는 밥을 먹어요.', $out);
    }

    public function test_strips_double_angle_quotes_and_collapses_whitespace(): void
    {
        $input = "\u{00AB}물\u{00BB}   한 잔";
        $out = VocabularyTtsTextSanitizer::forSpeech($input);

        $this->assertSame('물 한 잔', $out);
    }
}
