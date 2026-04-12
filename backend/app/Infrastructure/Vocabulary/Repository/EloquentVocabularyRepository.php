<?php

declare(strict_types=1);

namespace App\Infrastructure\Vocabulary\Repository;

use App\Domain\Vocabulary\Entity\Vocabulary as DomainVocabulary;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;
use App\Models\Vocabulary as EloquentVocabulary;

final class EloquentVocabularyRepository implements VocabularyRepositoryInterface
{
    public function list(): array
    {
        return EloquentVocabulary::query()
            ->orderBy('level')
            ->orderBy('term')
            ->get()
            ->map(static fn (EloquentVocabulary $m): DomainVocabulary => VocabularyMapper::toDomain($m))
            ->all();
    }

    public function findById(VocabularyId $id): ?DomainVocabulary
    {
        $model = EloquentVocabulary::query()->find($id->value());

        return $model ? VocabularyMapper::toDomain($model) : null;
    }

    public function listByStatus(
        VocabularyStatus $status,
        ?TopikLevel $level = null,
        ?EntryType $entryType = null,
        ?PartOfSpeech $pos = null,
    ): array {
        $q = EloquentVocabulary::query()->where('status', $status->value);

        if ($level !== null) {
            $q->where('level', $level->value);
        }
        if ($entryType !== null) {
            $q->where('entry_type', $entryType->value);
        }
        if ($pos !== null) {
            $q->where('pos', $pos->value);
        }

        return $q->orderBy('level')
            ->orderBy('term')
            ->get()
            ->map(static fn (EloquentVocabulary $m): DomainVocabulary => VocabularyMapper::toDomain($m))
            ->all();
    }

    public function findByIdAndStatus(VocabularyId $id, VocabularyStatus $status): ?DomainVocabulary
    {
        $model = EloquentVocabulary::query()
            ->whereKey($id->value())
            ->where('status', $status->value)
            ->first();

        return $model ? VocabularyMapper::toDomain($model) : null;
    }

    public function save(DomainVocabulary $vocabulary): void
    {
        EloquentVocabulary::query()->updateOrCreate(
            ['id' => $vocabulary->id()->value()],
            [
                'term' => $vocabulary->term()->value(),
                'meaning_ja' => $vocabulary->meaningJa()->value(),
                'pos' => $vocabulary->pos()->value,
                'level' => $vocabulary->level()->value,
                'entry_type' => $vocabulary->entryType()->value,
                'example_sentence' => $vocabulary->exampleSentence(),
                'example_translation_ja' => $vocabulary->exampleTranslationJa(),
                'audio_url' => $vocabulary->audioUrl(),
                'example_audio_url' => $vocabulary->exampleAudioUrl(),
                'status' => $vocabulary->status()->value,
            ],
        );
    }

    public function delete(VocabularyId $id): void
    {
        EloquentVocabulary::query()->whereKey($id->value())->delete();
    }

    public function existsByUniqueKey(Term $term, PartOfSpeech $pos, MeaningJa $meaningJa): bool
    {
        return EloquentVocabulary::query()
            ->where('term', $term->value())
            ->where('pos', $pos->value)
            ->where('meaning_ja', $meaningJa->value())
            ->exists();
    }

    public function existsByUniqueKeyExcludingId(
        VocabularyId $excludeId,
        Term $term,
        PartOfSpeech $pos,
        MeaningJa $meaningJa,
    ): bool {
        return EloquentVocabulary::query()
            ->where('id', '!=', $excludeId->value())
            ->where('term', $term->value())
            ->where('pos', $pos->value)
            ->where('meaning_ja', $meaningJa->value())
            ->exists();
    }
}
