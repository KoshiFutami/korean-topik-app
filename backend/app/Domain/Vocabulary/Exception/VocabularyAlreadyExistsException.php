<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Exception;

use RuntimeException;

final class VocabularyAlreadyExistsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('同じ単語が既に登録されています。');
    }
}

