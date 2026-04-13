<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\ListBookmarks;

final class ListBookmarksInput
{
    public function __construct(
        public readonly string $userId,
    ) {}
}
