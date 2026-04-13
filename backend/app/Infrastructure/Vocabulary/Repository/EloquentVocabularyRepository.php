<?php

declare(strict_types=1);

namespace App\Infrastructure\Vocabulary\Repository;

use App\Domain\Vocabulary\Entity\Vocabulary as DomainVocabulary;
use App\Domain\Vocabulary\ReadModel\VocabularyListCardReadModel;
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
        ?string $q = null,
    ): array {
        $q_ = EloquentVocabulary::query()->where('status', $status->value);

        if ($level !== null) {
            $q_->where('level', $level->value);
        }
        if ($entryType !== null) {
            $q_->where('entry_type', $entryType->value);
        }
        if ($pos !== null) {
            $q_->where('pos', $pos->value);
        }
        if ($q !== null) {
            $q_->where(static function ($query) use ($q): void {
                $query->where('term', 'like', '%'.$q.'%')
                    ->orWhere('meaning_ja', 'like', '%'.$q.'%');
            });
        }

        return $q_->orderBy('level')
            ->orderBy('term')
            ->get()
            ->map(static fn (EloquentVocabulary $m): DomainVocabulary => VocabularyMapper::toDomain($m))
            ->all();
    }

    public function listCardsByStatus(
        VocabularyStatus $status,
        ?TopikLevel $level = null,
        ?EntryType $entryType = null,
        ?PartOfSpeech $pos = null,
        ?string $q = null,
    ): array {
        $query = EloquentVocabulary::query()
            ->select([
                'id',
                'term',
                'meaning_ja',
                'pos',
                'level',
                'entry_type',
                'audio_url',
            ])
            ->where('status', $status->value);

        if ($level !== null) {
            $query->where('level', $level->value);
        }
        if ($entryType !== null) {
            $query->where('entry_type', $entryType->value);
        }
        if ($pos !== null) {
            $query->where('pos', $pos->value);
        }
        if ($q !== null) {
            $query->where(static function ($sub) use ($q): void {
                $sub->where('term', 'like', '%'.$q.'%')
                    ->orWhere('meaning_ja', 'like', '%'.$q.'%');
            });
        }

        return $query->orderBy('level')
            ->orderBy('term')
            ->get()
            ->map(static fn (EloquentVocabulary $m): VocabularyListCardReadModel => new VocabularyListCardReadModel(
                id: (string) $m->id,
                term: (string) $m->term,
                meaningJa: (string) $m->meaning_ja,
                pos: (string) $m->pos,
                level: (int) $m->level,
                entryType: (string) $m->entry_type,
                audioUrl: $m->audio_url !== null ? (string) $m->audio_url : null,
            ))
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
