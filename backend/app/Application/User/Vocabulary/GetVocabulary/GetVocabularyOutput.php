<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\GetVocabulary;

final class GetVocabularyOutput
{
    public function __construct(
        public readonly string $id,
        public readonly string $term,
        public readonly string $meaningJa,
        public readonly string $pos,
        public readonly string $posLabelJa,
        public readonly int $level,
        public readonly string $levelLabelJa,
        public readonly string $entryType,
        public readonly string $entryTypeLabelJa,
        public readonly ?string $exampleSentence,
        public readonly ?string $exampleTranslationJa,
        public readonly ?string $audioUrl,
    ) {}
}
