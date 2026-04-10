<?php

declare(strict_types=1);

namespace App\Application\User\Auth\GetMyProfile;

final class GetMyProfileInput
{
    public function __construct(public readonly string $userId) {}
}

