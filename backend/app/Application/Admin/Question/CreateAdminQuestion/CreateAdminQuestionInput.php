<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\CreateAdminQuestion;

final class CreateAdminQuestionInput
{
    /** @param array<int, CreateAdminQuestionOptionInput> $options */
    public function __construct(
        public readonly int $level,
        public readonly string $questionType,
        public readonly string $questionText,
        public readonly ?string $questionTextJa,
        public readonly ?string $explanationJa,
        public readonly string $status,
        public readonly array $options,
    ) {}
}
