<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\UpdateAdminQuestion;

final class UpdateAdminQuestionInput
{
    /** @param array<int, UpdateAdminQuestionOptionInput> $options */
    public function __construct(
        public readonly string $id,
        public readonly int $level,
        public readonly string $questionType,
        public readonly string $questionText,
        public readonly ?string $questionTextJa,
        public readonly ?string $explanationJa,
        public readonly string $status,
        public readonly array $options,
    ) {}
}
