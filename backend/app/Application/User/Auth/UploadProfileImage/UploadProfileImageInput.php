<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UploadProfileImage;

use Illuminate\Http\UploadedFile;

final class UploadProfileImageInput
{
    public function __construct(
        public readonly string $userId,
        public readonly UploadedFile $file,
    ) {}
}
