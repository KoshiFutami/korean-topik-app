<?php

declare(strict_types=1);

namespace App\Domain\User\ValueObject;

use InvalidArgumentException;

final class UserNickname
{
    private const MAX_LENGTH = 50;

    public function __construct(private readonly string $value)
    {
        $length = mb_strlen(trim($value));

        if ($length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                'Nickname must be at most '.self::MAX_LENGTH.' characters.'
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
