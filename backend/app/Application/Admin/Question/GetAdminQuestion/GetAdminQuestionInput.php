<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\GetAdminQuestion;

final class GetAdminQuestionInput
{
    public function __construct(public readonly string $id) {}
}
