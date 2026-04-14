<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\BulkUpsertVocabularies;

use App\Domain\Vocabulary\Entity\Vocabulary;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class BulkUpsertVocabulariesUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(BulkUpsertVocabulariesInput $input): BulkUpsertVocabulariesOutput
    {
        $created = 0;
        $updated = 0;

        foreach ($input->rows as $row) {
            $term = new Term($row['term']);
            $meaningJa = new MeaningJa($row['meaning_ja']);
            $pos = PartOfSpeech::from($row['pos']);
            $level = TopikLevel::from($row['level']);
            $entryType = EntryType::from($row['entry_type']);
            $status = VocabularyStatus::from($row['status']);

            $existing = $this->vocabularies->findByUniqueKey($term, $pos, $meaningJa);

            if ($existing !== null) {
                $exampleAudioUrl = $existing->exampleSentence() !== $row['example_sentence']
                    ? null
                    : $existing->exampleAudioUrl();

                $existing->update(
                    term: $term,
                    meaningJa: $meaningJa,
                    pos: $pos,
                    level: $level,
                    entryType: $entryType,
                    exampleSentence: $row['example_sentence'],
                    exampleTranslationJa: $row['example_translation_ja'],
                    audioUrl: $existing->audioUrl(),
                    exampleAudioUrl: $exampleAudioUrl,
                    status: $status,
                );
                $this->vocabularies->save($existing);
                $updated++;
            } else {
                $vocabulary = Vocabulary::create(
                    term: $term,
                    meaningJa: $meaningJa,
                    pos: $pos,
                    level: $level,
                    entryType: $entryType,
                    exampleSentence: $row['example_sentence'],
                    exampleTranslationJa: $row['example_translation_ja'],
                    audioUrl: null,
                    exampleAudioUrl: null,
                    status: $status,
                );
                $this->vocabularies->save($vocabulary);
                $created++;
            }
        }

        return new BulkUpsertVocabulariesOutput(created: $created, updated: $updated);
    }
}
