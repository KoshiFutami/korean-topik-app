<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\LogoutAdmin;

final class LogoutAdminInput
{
    public function __construct(public readonly string $adminId) {}
}

