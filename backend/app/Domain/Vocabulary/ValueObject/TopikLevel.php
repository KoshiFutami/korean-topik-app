<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

use InvalidArgumentException;

final class TopikLevel
{
    public function __construct(private readonly int $value)
    {
        if ($value < 1 || $value > 6) {
            throw new InvalidArgumentException('TOPIKレベルは1〜6で指定してください。');
        }
    }

    public function value(): int
    {
        return $this->value;
    }
}

