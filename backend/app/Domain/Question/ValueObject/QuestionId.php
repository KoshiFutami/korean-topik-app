<?php

declare(strict_types=1);

namespace App\Domain\Question\ValueObject;

use Illuminate\Support\Str;

final class QuestionId
{
    private function __construct(private readonly string $value) {}

    public static function generate(): self
    {
        return new self((string) Str::ulid());
    }

    public static function from(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }
}
