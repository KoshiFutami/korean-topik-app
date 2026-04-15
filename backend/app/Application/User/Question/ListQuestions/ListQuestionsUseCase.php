<?php

declare(strict_types=1);

namespace App\Application\User\Question\ListQuestions;

use App\Domain\Question\Repository\QuestionRepositoryInterface;
use App\Domain\Question\ValueObject\QuestionStatus;
use App\Domain\Question\ValueObject\QuestionType;
use App\Domain\Vocabulary\ValueObject\TopikLevel;

final class ListQuestionsUseCase
{
    public function __construct(private readonly QuestionRepositoryInterface $questions) {}

    public function execute(ListQuestionsInput $input): ListQuestionsOutput
    {
        $questionType = $input->questionType !== null ? QuestionType::from($input->questionType) : null;

        $items = $this->questions->listByStatus(
            QuestionStatus::PUBLISHED,
            level: $input->level,
            questionType: $questionType,
        );

        return new ListQuestionsOutput(
            questions: array_map(static function ($q): ListQuestionsQuestion {
                $options = array_map(
                    static fn ($o): ListQuestionsQuestionOption => new ListQuestionsQuestionOption(
                        optionNumber: (int) $o->optionNumber(),
                        text: $o->text(),
                        textJa: $o->textJa(),
                    ),
                    $q->options(),
                );

                return new ListQuestionsQuestion(
                    id: $q->id()->value(),
                    level: $q->level(),
                    levelLabelJa: TopikLevel::from($q->level())->labelJa(),
                    questionType: $q->questionType()->value,
                    questionTypeLabelJa: $q->questionType()->labelJa(),
                    questionText: $q->questionText(),
                    questionTextJa: $q->questionTextJa(),
                    explanationJa: $q->explanationJa(),
                    options: $options,
                    correctOptionNumber: $q->correctOptionNumber(),
                );
            }, $items),
        );
    }
}
