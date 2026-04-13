<?php

declare(strict_types=1);

namespace App\Domain\Bookmark\Exception;

use RuntimeException;

final class BookmarkNotFoundException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('ブックマークが見つかりません。');
    }
}
