<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

use InvalidArgumentException;

final class VocabularyStatus
{
    private readonly string $value;

    public function __construct(string $value)
    {
        $value = trim($value);
        if ($value === '') {
            throw new InvalidArgumentException('ステータスは必須です。');
        }

        $allowed = ['draft', 'published', 'archived'];
        if (! in_array($value, $allowed, true)) {
            throw new InvalidArgumentException('ステータスが不正です。');
        }

        $this->value = $value;
    }

    public static function published(): self
    {
        return new self('published');
    }

    public function value(): string
    {
        return $this->value;
    }
}

