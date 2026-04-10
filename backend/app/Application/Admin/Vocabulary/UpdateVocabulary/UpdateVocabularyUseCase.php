<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\UpdateVocabulary;

use App\Domain\Vocabulary\Exception\VocabularyAlreadyExistsException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class UpdateVocabularyUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(UpdateVocabularyInput $input): UpdateVocabularyOutput
    {
        $id = new VocabularyId($input->id);
        $vocabulary = $this->vocabularies->findById($id);
        if ($vocabulary === null) {
            throw new VocabularyNotFoundException();
        }

        $term = new Term($input->term);
        $meaningJa = new MeaningJa($input->meaningJa);
        $pos = new PartOfSpeech($input->pos);
        $level = new TopikLevel($input->level);
        $status = $input->status !== null ? new VocabularyStatus($input->status) : VocabularyStatus::published();

        if ($this->vocabularies->existsByUniqueKeyExcludingId($id, $term, $pos, $meaningJa)) {
            throw new VocabularyAlreadyExistsException();
        }

        $vocabulary->update(
            term: $term,
            meaningJa: $meaningJa,
            pos: $pos,
            level: $level,
            exampleSentence: $input->exampleSentence,
            exampleTranslationJa: $input->exampleTranslationJa,
            audioUrl: $input->audioUrl,
            status: $status,
        );

        $this->vocabularies->save($vocabulary);

        return new UpdateVocabularyOutput(
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

