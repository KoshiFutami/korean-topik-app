<?php

declare(strict_types=1);

namespace App\Domain\Question\ValueObject;

enum QuestionType: string
{
    case GRAMMAR = 'grammar';
    case TOPIC = 'topic';

    public function labelJa(): string
    {
        return match ($this) {
            self::GRAMMAR => '文法',
            self::TOPIC => '主題',
        };
    }
}
