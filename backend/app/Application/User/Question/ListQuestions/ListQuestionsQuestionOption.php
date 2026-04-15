<?php

declare(strict_types=1);

namespace App\Application\User\Question\ListQuestions;

final class ListQuestionsQuestionOption
{
    public function __construct(
        public readonly int $optionNumber,
        public readonly string $text,
        public readonly ?string $textJa,
    ) {}
}
