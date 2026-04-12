<?php

declare(strict_types=1);

namespace App\Domain\Bookmark\Repository;

use App\Domain\Bookmark\Entity\Bookmark;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\ValueObject\VocabularyId;

interface BookmarkRepositoryInterface
{
    /** @return Bookmark[] */
    public function findByUserId(UserId $userId): array;

    public function existsByUserIdAndVocabularyId(UserId $userId, VocabularyId $vocabularyId): bool;

    public function save(Bookmark $bookmark): void;

    public function deleteByUserIdAndVocabularyId(UserId $userId, VocabularyId $vocabularyId): void;
}
