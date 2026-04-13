<?php

declare(strict_types=1);

namespace App\Domain\User\ValueObject;

use InvalidArgumentException;

final class UserNickname
{
    private const MIN_LENGTH = 1;

    private const MAX_LENGTH = 10;

    private readonly string $value;

    public function __construct(string $value)
    {
        $trimmed = trim($value);
        $length = mb_strlen($trimmed);

        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                'User nickname must be between '.self::MIN_LENGTH.' and '.self::MAX_LENGTH.' characters.'
            );
        }

        $this->value = $trimmed;
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
