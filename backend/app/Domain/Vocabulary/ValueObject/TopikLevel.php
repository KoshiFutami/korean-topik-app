<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

enum TopikLevel: int
{
    case LEVEL_1 = 1;
    case LEVEL_2 = 2;
    case LEVEL_3 = 3;
    case LEVEL_4 = 4;
    case LEVEL_5 = 5;
    case LEVEL_6 = 6;

    public function labelJa(): string
    {
        return match ($this) {
            self::LEVEL_1 => '1級',
            self::LEVEL_2 => '2級',
            self::LEVEL_3 => '3級',
            self::LEVEL_4 => '4級',
            self::LEVEL_5 => '5級',
            self::LEVEL_6 => '6級',
        };
    }
}

