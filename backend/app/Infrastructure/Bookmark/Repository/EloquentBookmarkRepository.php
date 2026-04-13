<?php

declare(strict_types=1);

namespace App\Infrastructure\Bookmark\Repository;

use App\Domain\Bookmark\Entity\Bookmark as DomainBookmark;
use App\Domain\Bookmark\Repository\BookmarkRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Models\Bookmark as EloquentBookmark;

final class EloquentBookmarkRepository implements BookmarkRepositoryInterface
{
    public function findByUserId(UserId $userId): array
    {
        return EloquentBookmark::query()
            ->where('user_id', $userId->value())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(static fn (EloquentBookmark $m): DomainBookmark => BookmarkMapper::toDomain($m))
            ->all();
    }

    public function existsByUserIdAndVocabularyId(UserId $userId, VocabularyId $vocabularyId): bool
    {
        return EloquentBookmark::query()
            ->where('user_id', $userId->value())
            ->where('vocabulary_id', $vocabularyId->value())
            ->exists();
    }

    public function save(DomainBookmark $bookmark): void
    {
        EloquentBookmark::query()->create([
            'id' => $bookmark->id()->value(),
            'user_id' => $bookmark->userId()->value(),
            'vocabulary_id' => $bookmark->vocabularyId()->value(),
        ]);
    }

    public function deleteByUserIdAndVocabularyId(UserId $userId, VocabularyId $vocabularyId): void
    {
        EloquentBookmark::query()
            ->where('user_id', $userId->value())
            ->where('vocabulary_id', $vocabularyId->value())
            ->delete();
    }
}
