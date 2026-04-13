<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\CreateVocabulary;

use App\Domain\Vocabulary\Entity\Vocabulary;
use App\Domain\Vocabulary\Exception\VocabularyAlreadyExistsException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\EntryType;
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
        $pos = PartOfSpeech::from($input->pos);
        $level = TopikLevel::from($input->level);
        $entryType = $input->entryType !== null ? EntryType::from($input->entryType) : EntryType::WORD;
        $status = $input->status !== null ? VocabularyStatus::from($input->status) : VocabularyStatus::PUBLISHED;

        if ($this->vocabularies->existsByUniqueKey($term, $pos, $meaningJa)) {
            throw new VocabularyAlreadyExistsException;
        }

        $vocabulary = Vocabulary::create(
            term: $term,
            meaningJa: $meaningJa,
            pos: $pos,
            level: $level,
            entryType: $entryType,
            exampleSentence: $input->exampleSentence,
            exampleTranslationJa: $input->exampleTranslationJa,
            audioUrl: $input->audioUrl,
            status: $status,
        );

        $this->vocabularies->save($vocabulary);

        return new CreateVocabularyOutput(
            $vocabulary->id()->value(),
            $vocabulary->term()->value(),
            $vocabulary->meaningJa()->value(),
            $vocabulary->pos()->value,
            $vocabulary->level()->value,
            $vocabulary->entryType()->value,
            $vocabulary->exampleSentence(),
            $vocabulary->exampleTranslationJa(),
            $vocabulary->audioUrl(),
            $vocabulary->exampleAudioUrl(),
            $vocabulary->status()->value,
            $vocabulary->createdAt()->format(DATE_ATOM),
        );
    }
}
