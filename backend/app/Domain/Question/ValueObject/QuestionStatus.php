<?php

declare(strict_types=1);

namespace App\Domain\Question\ValueObject;

enum QuestionStatus: string
{
    case PUBLISHED = 'published';
    case DRAFT = 'draft';
}
