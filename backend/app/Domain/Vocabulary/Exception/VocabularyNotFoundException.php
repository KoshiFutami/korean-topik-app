<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Exception;

use RuntimeException;

final class VocabularyNotFoundException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('単語が見つかりません。');
    }
}
