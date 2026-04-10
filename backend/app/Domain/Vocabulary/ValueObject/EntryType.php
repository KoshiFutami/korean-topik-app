<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

enum EntryType: string
{
    case WORD = 'word';
    case PHRASE = 'phrase';
    case IDIOM = 'idiom';

    public function labelJa(): string
    {
        return match ($this) {
            self::WORD => '単語',
            self::PHRASE => '熟語',
            self::IDIOM => '慣用句',
        };
    }
}

