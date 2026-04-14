<?php

declare(strict_types=1);

namespace App\Domain\Question\ValueObject;

enum QuestionType: string
{
    case GRAMMAR = 'grammar';

    public function labelJa(): string
    {
        return match ($this) {
            self::GRAMMAR => '文法',
        };
    }
}
