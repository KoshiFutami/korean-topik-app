<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\GetVocabulary;

use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class GetVocabularyUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(GetVocabularyInput $input): GetVocabularyOutput
    {
        $vocabulary = $this->vocabularies->findByIdAndStatus(
            new VocabularyId($input->id),
            VocabularyStatus::PUBLISHED,
        );

        if ($vocabulary === null) {
            throw new VocabularyNotFoundException;
        }

        return new GetVocabularyOutput(
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
            audioUrl: $vocabulary->audioUrl(),
        );
    }
}
