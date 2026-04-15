<?php

declare(strict_types=1);

namespace App\Domain\Question\ValueObject;

enum QuestionStatus: string
{
    case PUBLISHED = 'published';
    case DRAFT = 'draft';

    public function labelJa(): string
    {
        return match ($this) {
            self::PUBLISHED => '公開',
            self::DRAFT => '下書き',
        };
    }
}
