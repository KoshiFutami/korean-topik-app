<?php

declare(strict_types=1);

namespace App\Infrastructure\Bookmark\Repository;

use App\Domain\Bookmark\Entity\Bookmark as DomainBookmark;
use App\Domain\Bookmark\ValueObject\BookmarkId;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Models\Bookmark as EloquentBookmark;
use DateTimeImmutable;

final class BookmarkMapper
{
    public static function toDomain(EloquentBookmark $model): DomainBookmark
    {
        return DomainBookmark::reconstruct(
            id: new BookmarkId((string) $model->id),
            userId: new UserId((string) $model->user_id),
            vocabularyId: new VocabularyId((string) $model->vocabulary_id),
            createdAt: new DateTimeImmutable($model->created_at?->toISOString() ?? 'now'),
        );
    }
}
