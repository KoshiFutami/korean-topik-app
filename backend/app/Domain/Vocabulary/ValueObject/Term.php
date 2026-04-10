<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

use InvalidArgumentException;

final class Term
{
    private readonly string $value;

    public function __construct(string $value)
    {
        $value = trim($value);
        if ($value === '') {
            throw new InvalidArgumentException('単語は必須です。');
        }
        if (mb_strlen($value) > 255) {
            throw new InvalidArgumentException('単語は255文字以内で入力してください。');
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
