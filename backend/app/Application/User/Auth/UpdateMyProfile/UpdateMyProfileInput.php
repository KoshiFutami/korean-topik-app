<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateMyProfile;

final class UpdateMyProfileInput
{
    public function __construct(
        public readonly string $userId,
        public readonly string $name,
        public readonly ?string $nickname,
        public readonly string $email,
        public readonly ?string $currentPassword,
        public readonly ?string $newPassword,
    ) {}
}
