<?php

declare(strict_types=1);

namespace App\Domain\Bookmark\Exception;

use RuntimeException;

final class BookmarkAlreadyExistsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('この語彙は既にブックマーク済みです。');
    }
}
