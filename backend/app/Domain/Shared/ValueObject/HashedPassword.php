<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final class HashedPassword
{
    public function __construct(private readonly string $value) {}

    public function value(): string
    {
        return $this->value;
    }
}
