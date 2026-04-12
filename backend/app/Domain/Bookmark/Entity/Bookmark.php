<?php

declare(strict_types=1);

namespace App\Domain\Bookmark\Entity;

use App\Domain\Bookmark\ValueObject\BookmarkId;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use DateTimeImmutable;

final class Bookmark
{
    private function __construct(
        private readonly BookmarkId $id,
        private readonly UserId $userId,
        private readonly VocabularyId $vocabularyId,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function create(
        UserId $userId,
        VocabularyId $vocabularyId,
    ): self {
        return new self(
            id: BookmarkId::generate(),
            userId: $userId,
            vocabularyId: $vocabularyId,
            createdAt: new DateTimeImmutable,
        );
    }

    public static function reconstruct(
        BookmarkId $id,
        UserId $userId,
        VocabularyId $vocabularyId,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            vocabularyId: $vocabularyId,
            createdAt: $createdAt,
        );
    }

    public function id(): BookmarkId
    {
        return $this->id;
    }

    public function userId(): UserId
    {
        return $this->userId;
    }

    public function vocabularyId(): VocabularyId
    {
        return $this->vocabularyId;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
