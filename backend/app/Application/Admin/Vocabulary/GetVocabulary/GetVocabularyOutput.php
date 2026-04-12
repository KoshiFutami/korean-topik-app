<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\GetVocabulary;

final class GetVocabularyOutput
{
    public function __construct(
        public readonly string $id,
        public readonly string $term,
        public readonly string $meaningJa,
        public readonly string $pos,
        public readonly int $level,
        public readonly string $entryType,
        public readonly ?string $exampleSentence,
        public readonly ?string $exampleTranslationJa,
        public readonly ?string $audioUrl,
        public readonly ?string $exampleAudioUrl,
        public readonly string $status,
        public readonly string $createdAt,
    ) {}
}
