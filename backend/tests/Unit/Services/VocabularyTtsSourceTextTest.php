<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Vocabulary;
use App\Services\Vocabulary\VocabularyTtsSourceText;
use PHPUnit\Framework\TestCase;

final class VocabularyTtsSourceTextTest extends TestCase
{
    public function test_example_only_returns_sanitized_sentence(): void
    {
        $model = new Vocabulary;
        $model->example_sentence = '물을 마셔요.';

        $this->assertNotSame('', VocabularyTtsSourceText::exampleOnly($model));
    }

    public function test_example_only_returns_empty_when_missing(): void
    {
        $model = new Vocabulary;
        $model->example_sentence = null;

        $this->assertSame('', VocabularyTtsSourceText::exampleOnly($model));
    }
}
