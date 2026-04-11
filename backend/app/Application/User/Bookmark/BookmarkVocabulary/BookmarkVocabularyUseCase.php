<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\BookmarkVocabulary;

use App\Domain\Bookmark\Entity\Bookmark;
use App\Domain\Bookmark\Exception\BookmarkAlreadyExistsException;
use App\Domain\Bookmark\Repository\BookmarkRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class BookmarkVocabularyUseCase
{
    public function __construct(
        private readonly BookmarkRepositoryInterface $bookmarkRepository,
        private readonly VocabularyRepositoryInterface $vocabularyRepository,
    ) {}

    public function execute(BookmarkVocabularyInput $input): void
    {
        $userId = new UserId($input->userId);
        $vocabularyId = new VocabularyId($input->vocabularyId);

        $vocabulary = $this->vocabularyRepository->findByIdAndStatus($vocabularyId, VocabularyStatus::PUBLISHED);
        if ($vocabulary === null) {
            throw new VocabularyNotFoundException;
        }

        if ($this->bookmarkRepository->existsByUserIdAndVocabularyId($userId, $vocabularyId)) {
            throw new BookmarkAlreadyExistsException;
        }

        $bookmark = Bookmark::create($userId, $vocabularyId);
        $this->bookmarkRepository->save($bookmark);
    }
}
