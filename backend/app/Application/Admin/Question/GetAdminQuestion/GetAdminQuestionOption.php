<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\GetAdminQuestion;

final class GetAdminQuestionOption
{
    public function __construct(
        public readonly int $optionNumber,
        public readonly string $text,
        public readonly ?string $textJa,
        public readonly bool $isCorrect,
    ) {}
}
