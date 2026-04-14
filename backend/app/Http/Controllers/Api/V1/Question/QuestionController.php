<?php

namespace App\Http\Controllers\Api\V1\Question;

use App\Application\User\Question\ListQuestions\ListQuestionsInput;
use App\Application\User\Question\ListQuestions\ListQuestionsUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController
{
    public function __construct(
        private readonly ListQuestionsUseCase $listQuestions,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $output = $this->listQuestions->execute(new ListQuestionsInput(
            level: $request->query('level') !== null ? (int) $request->query('level') : null,
            questionType: $request->query('type') !== null ? (string) $request->query('type') : null,
        ));

        return response()->json([
            'questions' => array_map(static fn ($q) => [
                'id' => $q->id,
                'level' => $q->level,
                'level_label_ja' => $q->levelLabelJa,
                'question_type' => $q->questionType,
                'question_type_label_ja' => $q->questionTypeLabelJa,
                'question_text' => $q->questionText,
                'explanation_ja' => $q->explanationJa,
                'options' => array_map(static fn ($o) => [
                    'option_number' => $o->optionNumber,
                    'text' => $o->text,
                ], $q->options),
                'correct_option_number' => $q->correctOptionNumber,
            ], $output->questions),
        ]);
    }
}
