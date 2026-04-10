<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

use InvalidArgumentException;

final class MeaningJa
{
    private readonly string $value;

    public function __construct(string $value)
    {
        $value = trim($value);
        if ($value === '') {
            throw new InvalidArgumentException('日本語の意味は必須です。');
        }
        if (mb_strlen($value) > 255) {
            throw new InvalidArgumentException('日本語の意味は255文字以内で入力してください。');
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}

