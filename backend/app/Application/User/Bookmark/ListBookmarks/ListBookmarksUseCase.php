<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\ListBookmarks;

use App\Domain\Bookmark\Repository\BookmarkRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class ListBookmarksUseCase
{
    public function __construct(
        private readonly BookmarkRepositoryInterface $bookmarkRepository,
        private readonly VocabularyRepositoryInterface $vocabularyRepository,
    ) {}

    public function execute(ListBookmarksInput $input): ListBookmarksOutput
    {
        $userId = new UserId($input->userId);
        $bookmarks = $this->bookmarkRepository->findByUserId($userId);

        $vocabularies = [];
        foreach ($bookmarks as $bookmark) {
            $vocabulary = $this->vocabularyRepository->findByIdAndStatus(
                $bookmark->vocabularyId(),
                VocabularyStatus::PUBLISHED,
            );

            if ($vocabulary === null) {
                continue;
            }

            $vocabularies[] = ListBookmarksVocabulary::fromDomain($vocabulary, $bookmark);
        }

        return new ListBookmarksOutput($vocabularies);
    }
}
