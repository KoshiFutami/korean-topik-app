<?php

declare(strict_types=1);

namespace App\Domain\Question\Entity;

use App\Domain\Question\ValueObject\QuestionId;
use App\Domain\Question\ValueObject\QuestionStatus;
use App\Domain\Question\ValueObject\QuestionType;
use DateTimeImmutable;

final class TopikQuestion
{
    /** @param array<int, QuestionOption> $options */
    private function __construct(
        private readonly QuestionId $id,
        private int $level,
        private QuestionType $questionType,
        private string $questionText,
        private ?string $questionTextJa,
        private ?string $questionTextJaFilled,
        private ?string $explanationJa,
        private QuestionStatus $status,
        private array $options,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    /** @param array<int, QuestionOption> $options */
    public static function create(
        int $level,
        QuestionType $questionType,
        string $questionText,
        ?string $questionTextJa,
        ?string $questionTextJaFilled,
        ?string $explanationJa,
        QuestionStatus $status,
        array $options,
    ): self {
        return new self(
            id: QuestionId::generate(),
            level: $level,
            questionType: $questionType,
            questionText: $questionText,
            questionTextJa: $questionTextJa,
            questionTextJaFilled: $questionTextJaFilled,
            explanationJa: $explanationJa,
            status: $status,
            options: $options,
            createdAt: new DateTimeImmutable,
        );
    }

    /** @param array<int, QuestionOption> $options */
    public static function reconstruct(
        QuestionId $id,
        int $level,
        QuestionType $questionType,
        string $questionText,
        ?string $questionTextJa,
        ?string $questionTextJaFilled,
        ?string $explanationJa,
        QuestionStatus $status,
        array $options,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            level: $level,
            questionType: $questionType,
            questionText: $questionText,
            questionTextJa: $questionTextJa,
            questionTextJaFilled: $questionTextJaFilled,
            explanationJa: $explanationJa,
            status: $status,
            options: $options,
            createdAt: $createdAt,
        );
    }

    /** @param array<int, QuestionOption> $options */
    public function update(
        int $level,
        QuestionType $questionType,
        string $questionText,
        ?string $questionTextJa,
        ?string $questionTextJaFilled,
        ?string $explanationJa,
        QuestionStatus $status,
        array $options,
    ): void {
        $this->level = $level;
        $this->questionType = $questionType;
        $this->questionText = $questionText;
        $this->questionTextJa = $questionTextJa;
        $this->questionTextJaFilled = $questionTextJaFilled;
        $this->explanationJa = $explanationJa;
        $this->status = $status;
        $this->options = $options;
    }

    public function id(): QuestionId
    {
        return $this->id;
    }

    public function level(): int
    {
        return $this->level;
    }

    public function questionType(): QuestionType
    {
        return $this->questionType;
    }

    public function questionText(): string
    {
        return $this->questionText;
    }

    public function questionTextJa(): ?string
    {
        return $this->questionTextJa;
    }

    public function questionTextJaFilled(): ?string
    {
        return $this->questionTextJaFilled;
    }

    public function explanationJa(): ?string
    {
        return $this->explanationJa;
    }

    public function status(): QuestionStatus
    {
        return $this->status;
    }

    /** @return array<int, QuestionOption> */
    public function options(): array
    {
        return $this->options;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function correctOptionNumber(): int
    {
        foreach ($this->options as $option) {
            if ($option->isCorrect()) {
                return (int) $option->optionNumber();
            }
        }

        throw new \LogicException("Question {$this->id->value()} has no correct option defined.");
    }
}
