<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\GetVocabulary;

use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\VocabularyId;

final class GetVocabularyUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(GetVocabularyInput $input): GetVocabularyOutput
    {
        $vocabulary = $this->vocabularies->findById(new VocabularyId($input->id));
        if ($vocabulary === null) {
            throw new VocabularyNotFoundException();
        }

        return new GetVocabularyOutput(
            id: $vocabulary->id()->value(),
            term: $vocabulary->term()->value(),
            meaningJa: $vocabulary->meaningJa()->value(),
            pos: $vocabulary->pos()->value(),
            level: $vocabulary->level()->value(),
            exampleSentence: $vocabulary->exampleSentence(),
            exampleTranslationJa: $vocabulary->exampleTranslationJa(),
            audioUrl: $vocabulary->audioUrl(),
            status: $vocabulary->status()->value(),
            createdAt: $vocabulary->createdAt()->format(DATE_ATOM),
        );
    }
}

