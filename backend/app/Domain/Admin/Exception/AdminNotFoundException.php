<?php

declare(strict_types=1);

namespace App\Domain\Admin\Exception;

use RuntimeException;

final class AdminNotFoundException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('管理者が見つかりません。');
    }
}
