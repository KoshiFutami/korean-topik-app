<?php

declare(strict_types=1);

namespace App\Application\User\Question\ListQuestions;

final class ListQuestionsInput
{
    public function __construct(
        public readonly ?int $level = null,
        public readonly ?string $questionType = null,
    ) {}
}
