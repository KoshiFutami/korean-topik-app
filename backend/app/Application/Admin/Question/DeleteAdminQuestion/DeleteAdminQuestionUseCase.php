<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\DeleteAdminQuestion;

use App\Domain\Question\Exception\QuestionNotFoundException;
use App\Domain\Question\Repository\QuestionRepositoryInterface;
use App\Domain\Question\ValueObject\QuestionId;

final class DeleteAdminQuestionUseCase
{
    public function __construct(private readonly QuestionRepositoryInterface $questions) {}

    public function execute(DeleteAdminQuestionInput $input): void
    {
        $id = QuestionId::from($input->id);

        if ($this->questions->findById($id) === null) {
            throw new QuestionNotFoundException;
        }

        $this->questions->delete($id);
    }
}
