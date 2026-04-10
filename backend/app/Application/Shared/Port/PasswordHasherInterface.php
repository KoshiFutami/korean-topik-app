<?php

declare(strict_types=1);

namespace App\Application\Shared\Port;

use App\Domain\Shared\ValueObject\HashedPassword;

interface PasswordHasherInterface
{
    public function hash(string $plainPassword): HashedPassword;

    public function verify(string $plainPassword, HashedPassword $hashedPassword): bool;
}
