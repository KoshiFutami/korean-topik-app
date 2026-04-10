<?php

declare(strict_types=1);

namespace App\Domain\User\Exception;

use RuntimeException;

final class UserNotFoundException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('ユーザーが見つかりません。');
    }
}
