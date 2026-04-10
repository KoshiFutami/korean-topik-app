<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Repository;

use App\Domain\Vocabulary\Entity\Vocabulary;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\VocabularyId;

interface VocabularyRepositoryInterface
{
    /**
     * @return array<int, Vocabulary>
     */
    public function list(): array;

    public function findById(VocabularyId $id): ?Vocabulary;

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

