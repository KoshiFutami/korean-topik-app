<?php

declare(strict_types=1);

namespace App\Infrastructure\Shared\Password;

use App\Application\Shared\Port\PasswordHasherInterface;
use App\Domain\Shared\ValueObject\HashedPassword;
use Illuminate\Support\Facades\Hash;

final class BcryptPasswordHasher implements PasswordHasherInterface
{
    public function hash(string $plainPassword): HashedPassword
    {
        return new HashedPassword(Hash::make($plainPassword));
    }

    public function verify(string $plainPassword, HashedPassword $hashedPassword): bool
    {
        return Hash::check($plainPassword, $hashedPassword->value());
    }
}

