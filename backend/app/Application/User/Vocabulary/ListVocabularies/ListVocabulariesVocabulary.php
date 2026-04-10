<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

use App\Domain\Vocabulary\Entity\Vocabulary;

final class ListVocabulariesVocabulary
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
    ) {}

    public static function fromDomain(Vocabulary $vocabulary): self
    {
        return new self(
            id: $vocabulary->id()->value(),
            term: $vocabulary->term()->value(),
            meaningJa: $vocabulary->meaningJa()->value(),
            pos: $vocabulary->pos()->value,
            posLabelJa: $vocabulary->pos()->labelJa(),
            level: $vocabulary->level()->value,
            levelLabelJa: $vocabulary->level()->labelJa(),
            entryType: $vocabulary->entryType()->value,
            entryTypeLabelJa: $vocabulary->entryType()->labelJa(),
            exampleSentence: $vocabulary->exampleSentence(),
            exampleTranslationJa: $vocabulary->exampleTranslationJa(),
        );
    }
}
