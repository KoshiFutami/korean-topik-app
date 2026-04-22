<?php

declare(strict_types=1);

namespace App\Domain\User\ValueObject;

use InvalidArgumentException;

final class ProfileImagePath
{
    public function __construct(private readonly string $value)
    {
        if (trim($value) === '') {
            throw new InvalidArgumentException('Profile image path must not be empty.');
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }
}
