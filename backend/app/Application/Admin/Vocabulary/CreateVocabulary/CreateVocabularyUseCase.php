<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\CreateVocabulary;

use App\Domain\Vocabulary\Entity\Vocabulary;
use App\Domain\Vocabulary\Exception\VocabularyAlreadyExistsException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class CreateVocabularyUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(CreateVocabularyInput $input): CreateVocabularyOutput
    {
        $term = new Term($input->term);
        $meaningJa = new MeaningJa($input->meaningJa);
        $pos = new PartOfSpeech($input->pos);
        $level = new TopikLevel($input->level);
        $status = $input->status !== null ? VocabularyStatus::from($input->status) : VocabularyStatus::PUBLISHED;

        if ($this->vocabularies->existsByUniqueKey($term, $pos, $meaningJa)) {
            throw new VocabularyAlreadyExistsException();
        }

        $vocabulary = Vocabulary::create(
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

        return new CreateVocabularyOutput(
            id: $vocabulary->id()->value(),
            term: $vocabulary->term()->value(),
            meaningJa: $vocabulary->meaningJa()->value(),
            pos: $vocabulary->pos()->value(),
            level: $vocabulary->level()->value(),
            exampleSentence: $vocabulary->exampleSentence(),
            exampleTranslationJa: $vocabulary->exampleTranslationJa(),
            audioUrl: $vocabulary->audioUrl(),
            status: $vocabulary->status()->value,
            createdAt: $vocabulary->createdAt()->format(DATE_ATOM),
        );
    }
}

