<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\ListVocabularies;

use App\Domain\Vocabulary\Entity\Vocabulary;

final class ListVocabulariesVocabulary
{
    public function __construct(
        public readonly string $id,
        public readonly string $term,
        public readonly string $meaningJa,
        public readonly string $pos,
        public readonly int $level,
        public readonly ?string $exampleSentence,
        public readonly ?string $exampleTranslationJa,
        public readonly ?string $audioUrl,
        public readonly string $status,
        public readonly string $createdAt,
    ) {}

    public static function fromDomain(Vocabulary $vocabulary): self
    {
        return new self(
            id: $vocabulary->id()->value(),
            term: $vocabulary->term()->value(),
            meaningJa: $vocabulary->meaningJa()->value(),
            pos: $vocabulary->pos()->value,
            level: $vocabulary->level()->value,
            exampleSentence: $vocabulary->exampleSentence(),
            exampleTranslationJa: $vocabulary->exampleTranslationJa(),
            audioUrl: $vocabulary->audioUrl(),
            status: $vocabulary->status()->value,
            createdAt: $vocabulary->createdAt()->format(DATE_ATOM),
        );
    }
}

