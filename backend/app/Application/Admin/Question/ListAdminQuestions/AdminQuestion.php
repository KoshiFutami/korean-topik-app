<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\ListAdminQuestions;

final class AdminQuestion
{
    /** @param array<int, AdminQuestionOption> $options */
    public function __construct(
        public readonly string $id,
        public readonly int $level,
        public readonly string $levelLabelJa,
        public readonly string $questionType,
        public readonly string $questionTypeLabelJa,
        public readonly string $questionText,
        public readonly ?string $questionTextJa,
        public readonly ?string $explanationJa,
        public readonly string $status,
        public readonly string $statusLabelJa,
        public readonly array $options,
        public readonly int $correctOptionNumber,
        public readonly string $createdAt,
    ) {}
}
