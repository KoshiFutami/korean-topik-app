<?php

declare(strict_types=1);

namespace App\Domain\Question\Repository;

use App\Domain\Question\Entity\TopikQuestion;
use App\Domain\Question\ValueObject\QuestionId;
use App\Domain\Question\ValueObject\QuestionStatus;
use App\Domain\Question\ValueObject\QuestionType;

interface QuestionRepositoryInterface
{
    /**
     * @return array<int, TopikQuestion>
     */
    public function listByStatus(
        QuestionStatus $status,
        ?int $level = null,
        ?QuestionType $questionType = null,
    ): array;

    /**
     * @return array<int, TopikQuestion>
     */
    public function list(): array;

    public function findById(QuestionId $id): ?TopikQuestion;

    public function save(TopikQuestion $question): void;

    public function delete(QuestionId $id): void;
}
