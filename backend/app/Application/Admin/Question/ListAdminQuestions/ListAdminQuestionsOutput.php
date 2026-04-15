<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\ListAdminQuestions;

final class ListAdminQuestionsOutput
{
    /** @param array<int, AdminQuestion> $questions */
    public function __construct(public readonly array $questions) {}
}
