<?php

declare(strict_types=1);

namespace App\Infrastructure\Vocabulary\Repository;

use App\Domain\Vocabulary\Entity\Vocabulary as DomainVocabulary;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;
use App\Models\Vocabulary as EloquentVocabulary;
use DateTimeImmutable;

final class VocabularyMapper
{
    public static function toDomain(EloquentVocabulary $model): DomainVocabulary
    {
        return DomainVocabulary::reconstruct(
            id: new VocabularyId((string) $model->id),
            term: new Term((string) $model->term),
            meaningJa: new MeaningJa((string) $model->meaning_ja),
            pos: PartOfSpeech::from((string) $model->pos),
            level: TopikLevel::from((int) $model->level),
            entryType: EntryType::from((string) $model->entry_type),
            exampleSentence: $model->example_sentence ? (string) $model->example_sentence : null,
            exampleTranslationJa: $model->example_translation_ja ? (string) $model->example_translation_ja : null,
            audioUrl: $model->audio_url ? (string) $model->audio_url : null,
            status: VocabularyStatus::from((string) $model->status),
            createdAt: new DateTimeImmutable($model->created_at?->toISOString() ?? 'now'),
        );
    }
}
