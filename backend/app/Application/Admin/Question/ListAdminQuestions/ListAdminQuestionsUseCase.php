<?php

declare(strict_types=1);

namespace App\Application\Admin\Question\ListAdminQuestions;

use App\Domain\Question\Repository\QuestionRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\TopikLevel;

final class ListAdminQuestionsUseCase
{
    public function __construct(private readonly QuestionRepositoryInterface $questions) {}

    public function execute(): ListAdminQuestionsOutput
    {
        $items = $this->questions->list();

        return new ListAdminQuestionsOutput(
            questions: array_map(static function ($q): AdminQuestion {
                $options = array_map(
                    static fn ($o): AdminQuestionOption => new AdminQuestionOption(
                        optionNumber: (int) $o->optionNumber(),
                        text: $o->text(),
                        textJa: $o->textJa(),
                        isCorrect: $o->isCorrect(),
                    ),
                    $q->options(),
                );

                $correctOptionNumber = 0;
                foreach ($q->options() as $option) {
                    if ($option->isCorrect()) {
                        $correctOptionNumber = (int) $option->optionNumber();
                        break;
                    }
                }

                return new AdminQuestion(
                    id: $q->id()->value(),
                    level: $q->level(),
                    levelLabelJa: TopikLevel::from($q->level())->labelJa(),
                    questionType: $q->questionType()->value,
                    questionTypeLabelJa: $q->questionType()->labelJa(),
                    questionText: $q->questionText(),
                    questionTextJa: $q->questionTextJa(),
                    explanationJa: $q->explanationJa(),
                    status: $q->status()->value,
                    statusLabelJa: $q->status()->labelJa(),
                    options: $options,
                    correctOptionNumber: $correctOptionNumber,
                    createdAt: $q->createdAt()->format(DATE_ATOM),
                );
            }, $items),
        );
    }
}
