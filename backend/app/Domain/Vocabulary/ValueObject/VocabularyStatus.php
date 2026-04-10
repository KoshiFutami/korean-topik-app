<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

enum VocabularyStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}

