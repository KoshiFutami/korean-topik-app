<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\BookmarkVocabulary;

final class BookmarkVocabularyInput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $vocabularyId,
    ) {}
}
