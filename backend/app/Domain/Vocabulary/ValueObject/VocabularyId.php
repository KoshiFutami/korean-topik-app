<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

use Illuminate\Support\Str;
use InvalidArgumentException;

final class VocabularyId
{
    public function __construct(private readonly string $value)
    {
        if (! preg_match('/^[0-9A-HJKMNP-TV-Z]{26}$/i', $value)) {
            throw new InvalidArgumentException("Invalid ULID format: {$value}");
        }
    }

    public static function generate(): self
    {
        return new self((string) Str::ulid());
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
