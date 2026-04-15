<?php

declare(strict_types=1);

namespace App\Domain\Question\Exception;

use RuntimeException;

class QuestionNotFoundException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('問題が見つかりません。');
    }
}
