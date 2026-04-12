<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\UnbookmarkVocabulary;

use App\Domain\Bookmark\Exception\BookmarkNotFoundException;
use App\Domain\Bookmark\Repository\BookmarkRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\ValueObject\VocabularyId;

final class UnbookmarkVocabularyUseCase
{
    public function __construct(
        private readonly BookmarkRepositoryInterface $bookmarkRepository,
    ) {}

    public function execute(UnbookmarkVocabularyInput $input): void
    {
        $userId = new UserId($input->userId);
        $vocabularyId = new VocabularyId($input->vocabularyId);

        if (! $this->bookmarkRepository->existsByUserIdAndVocabularyId($userId, $vocabularyId)) {
            throw new BookmarkNotFoundException;
        }

        $this->bookmarkRepository->deleteByUserIdAndVocabularyId($userId, $vocabularyId);
    }
}
