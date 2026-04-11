<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\UnbookmarkVocabulary;

final class UnbookmarkVocabularyInput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $vocabularyId,
    ) {}
}
