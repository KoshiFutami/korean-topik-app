<?php

declare(strict_types=1);

namespace App\Application\User\Bookmark\ListBookmarks;

final class ListBookmarksOutput
{
    /**
     * @param  array<ListBookmarksVocabulary>  $vocabularies
     */
    public function __construct(
        public readonly array $vocabularies,
    ) {}
}
