<?php

declare(strict_types=1);

namespace App\Application\User\Question\ListQuestions;

final class ListQuestionsOutput
{
    /** @param array<int, ListQuestionsQuestion> $questions */
    public function __construct(
        public readonly array $questions,
    ) {}
}
