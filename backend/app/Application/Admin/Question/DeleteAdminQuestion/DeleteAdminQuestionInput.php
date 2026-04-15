<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\DeleteAdminQuestion;

final class DeleteAdminQuestionInput
{
    public function __construct(public readonly string $id) {}
}
