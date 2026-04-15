<?php

declare(strict_types=1);

namespace App\Domain\Question\Entity;

final class QuestionOption
{
    public function __construct(
        private readonly string $optionNumber,
        private readonly string $text,
        private readonly ?string $textJa,
        private readonly bool $isCorrect,
    ) {}

    public function optionNumber(): string
    {
        return $this->optionNumber;
    }

    public function text(): string
    {
        return $this->text;
    }

    public function textJa(): ?string
    {
        return $this->textJa;
    }

    public function isCorrect(): bool
    {
        return $this->isCorrect;
    }
}
