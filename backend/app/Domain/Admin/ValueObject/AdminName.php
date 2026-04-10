<?php

declare(strict_types=1);

namespace App\Domain\Admin\ValueObject;

use InvalidArgumentException;

final class AdminName
{
    private const MIN_LENGTH = 1;

    private const MAX_LENGTH = 100;

    public function __construct(private readonly string $value)
    {
        $length = mb_strlen(trim($value));

        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                "Admin name must be between ".self::MIN_LENGTH." and ".self::MAX_LENGTH." characters."
            );
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

