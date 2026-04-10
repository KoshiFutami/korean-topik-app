<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

enum VocabularyStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function labelJa(): string
    {
        return match ($this) {
            self::DRAFT => '下書き',
            self::PUBLISHED => '公開',
            self::ARCHIVED => 'アーカイブ',
        };
    }
}

