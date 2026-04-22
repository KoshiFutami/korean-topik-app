<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UploadProfileImage;

final class UploadProfileImageOutput
{
    public function __construct(
        public readonly string $profileImageUrl,
    ) {}
}
