<?php

declare(strict_types=1);

namespace App\Domain\PlannedFeature\ValueObject;

use Illuminate\Support\Str;
use InvalidArgumentException;

final class PlannedFeatureId
{
    public function __construct(private readonly string $value)
    {
        if (! preg_match('/^[0-9A-HJKMNP-TV-Z]{26}$/i', $value)) {
            throw new InvalidArgumentException("Invalid ULID format: {$value}");
        }
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public static function generate(): self
    {
        return new self((string) Str::ulid());
    }

    public function value(): string
    {
        return $this->value;
    }
}
