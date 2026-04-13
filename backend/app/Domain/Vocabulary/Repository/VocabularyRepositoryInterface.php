<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Repository;

use App\Domain\Vocabulary\Entity\Vocabulary;
use App\Domain\Vocabulary\ReadModel\VocabularyListCardReadModel;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

interface VocabularyRepositoryInterface
{
    /**
     * @return array<int, Vocabulary>
     */
    public function list(): array;

    public function findById(VocabularyId $id): ?Vocabulary;

    /**
     * @return array<int, Vocabulary>
     */
    public function listByStatus(
        VocabularyStatus $status,
        ?TopikLevel $level = null,
        ?EntryType $entryType = null,
        ?PartOfSpeech $pos = null,
        ?string $q = null,
    ): array;

    /**
     * 一覧カード向けに必要列のみ取得する（例文・例文音声 URL は読まない）。
     *
     * @return array<int, VocabularyListCardReadModel>
     */
    public function listCardsByStatus(
        VocabularyStatus $status,
        ?TopikLevel $level = null,
        ?EntryType $entryType = null,
        ?PartOfSpeech $pos = null,
        ?string $q = null,
    ): array;

    public function findByIdAndStatus(VocabularyId $id, VocabularyStatus $status): ?Vocabulary;

    public function save(Vocabulary $vocabulary): void;

    public function delete(VocabularyId $id): void;

    public function existsByUniqueKey(Term $term, PartOfSpeech $pos, MeaningJa $meaningJa): bool;

    public function existsByUniqueKeyExcludingId(
        VocabularyId $excludeId,
        Term $term,
        PartOfSpeech $pos,
        MeaningJa $meaningJa,
    ): bool;
}
