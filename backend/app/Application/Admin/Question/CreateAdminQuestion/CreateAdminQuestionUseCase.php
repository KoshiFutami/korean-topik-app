<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\CreateAdminQuestion;

use App\Domain\Question\Entity\QuestionOption;
use App\Domain\Question\Entity\TopikQuestion;
use App\Domain\Question\Repository\QuestionRepositoryInterface;
use App\Domain\Question\ValueObject\QuestionStatus;
use App\Domain\Question\ValueObject\QuestionType;
use App\Domain\Vocabulary\ValueObject\TopikLevel;

final class CreateAdminQuestionUseCase
{
    public function __construct(private readonly QuestionRepositoryInterface $questions) {}

    public function execute(CreateAdminQuestionInput $input): CreateAdminQuestionOutput
    {
        $options = array_map(
            static fn (CreateAdminQuestionOptionInput $o): QuestionOption => new QuestionOption(
                optionNumber: (string) $o->optionNumber,
                text: $o->text,
                textJa: $o->textJa,
                isCorrect: $o->isCorrect,
            ),
            $input->options,
        );

        $question = TopikQuestion::create(
            level: $input->level,
            questionType: QuestionType::from($input->questionType),
            questionText: $input->questionText,
            questionTextJa: $input->questionTextJa,
            questionTextJaFilled: null,
            explanationJa: $input->explanationJa,
            status: QuestionStatus::from($input->status),
            options: $options,
        );

        $this->questions->save($question);

        $correctOptionNumber = 0;
        foreach ($question->options() as $option) {
            if ($option->isCorrect()) {
                $correctOptionNumber = (int) $option->optionNumber();
                break;
            }
        }

        $outputOptions = array_map(
            static fn (QuestionOption $o): CreateAdminQuestionOption => new CreateAdminQuestionOption(
                optionNumber: (int) $o->optionNumber(),
                text: $o->text(),
                textJa: $o->textJa(),
                isCorrect: $o->isCorrect(),
            ),
            $question->options(),
        );

        return new CreateAdminQuestionOutput(
            id: $question->id()->value(),
            level: $question->level(),
            levelLabelJa: TopikLevel::from($question->level())->labelJa(),
            questionType: $question->questionType()->value,
            questionTypeLabelJa: $question->questionType()->labelJa(),
            questionText: $question->questionText(),
            questionTextJa: $question->questionTextJa(),
            explanationJa: $question->explanationJa(),
            status: $question->status()->value,
            statusLabelJa: $question->status()->labelJa(),
            options: $outputOptions,
            correctOptionNumber: $correctOptionNumber,
            createdAt: $question->createdAt()->format(DATE_ATOM),
        );
    }
}
