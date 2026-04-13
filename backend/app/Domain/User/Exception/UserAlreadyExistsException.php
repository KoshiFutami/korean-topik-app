<?php

declare(strict_types=1);

namespace App\Domain\User\Exception;

use RuntimeException;

final class UserAlreadyExistsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('このメールアドレスは既に使用されています。');
    }
}
