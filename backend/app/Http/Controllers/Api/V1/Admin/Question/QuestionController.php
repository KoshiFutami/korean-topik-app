<?php

namespace App\Http\Controllers\Api\V1\Admin\Question;

use App\Application\Admin\Question\CreateAdminQuestion\CreateAdminQuestionInput;
use App\Application\Admin\Question\CreateAdminQuestion\CreateAdminQuestionOptionInput;
use App\Application\Admin\Question\CreateAdminQuestion\CreateAdminQuestionUseCase;
use App\Application\Admin\Question\DeleteAdminQuestion\DeleteAdminQuestionInput;
use App\Application\Admin\Question\DeleteAdminQuestion\DeleteAdminQuestionUseCase;
use App\Application\Admin\Question\GetAdminQuestion\GetAdminQuestionInput;
use App\Application\Admin\Question\GetAdminQuestion\GetAdminQuestionUseCase;
use App\Application\Admin\Question\ListAdminQuestions\ListAdminQuestionsUseCase;
use App\Application\Admin\Question\UpdateAdminQuestion\UpdateAdminQuestionInput;
use App\Application\Admin\Question\UpdateAdminQuestion\UpdateAdminQuestionOptionInput;
use App\Application\Admin\Question\UpdateAdminQuestion\UpdateAdminQuestionUseCase;
use App\Domain\Question\Exception\QuestionNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Question\StoreQuestionRequest;
use App\Http\Requests\Api\V1\Admin\Question\UpdateQuestionRequest;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    public function __construct(
        private readonly ListAdminQuestionsUseCase $listAdminQuestions,
        private readonly GetAdminQuestionUseCase $getAdminQuestion,
        private readonly CreateAdminQuestionUseCase $createAdminQuestion,
        private readonly UpdateAdminQuestionUseCase $updateAdminQuestion,
        private readonly DeleteAdminQuestionUseCase $deleteAdminQuestion,
    ) {}

    public function index(): JsonResponse
    {
        $output = $this->listAdminQuestions->execute();

        return response()->json([
            'questions' => array_map(static fn ($q) => self::questionToArray($q), $output->questions),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $q = $this->getAdminQuestion->execute(new GetAdminQuestionInput(id: $id));

            return response()->json(['question' => self::questionToArray($q)]);
        } catch (QuestionNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function store(StoreQuestionRequest $request): JsonResponse
    {
        $optionInputs = array_map(
            static fn (array $o): CreateAdminQuestionOptionInput => new CreateAdminQuestionOptionInput(
                optionNumber: (int) $o['option_number'],
                text: (string) $o['text'],
                textJa: isset($o['text_ja']) ? (string) $o['text_ja'] : null,
                isCorrect: (bool) $o['is_correct'],
            ),
            (array) $request->input('options'),
        );

        $q = $this->createAdminQuestion->execute(new CreateAdminQuestionInput(
            level: (int) $request->input('level'),
            questionType: (string) $request->input('question_type'),
            questionText: (string) $request->input('question_text'),
            questionTextJa: $request->input('question_text_ja'),
            explanationJa: $request->input('explanation_ja'),
            status: $request->input('status') ?? 'draft',
            options: $optionInputs,
        ));

        return response()->json(['question' => self::questionToArray($q)], 201);
    }

    public function update(UpdateQuestionRequest $request, string $id): JsonResponse
    {
        try {
            $optionInputs = array_map(
                static fn (array $o): UpdateAdminQuestionOptionInput => new UpdateAdminQuestionOptionInput(
                    optionNumber: (int) $o['option_number'],
                    text: (string) $o['text'],
                    textJa: isset($o['text_ja']) ? (string) $o['text_ja'] : null,
                    isCorrect: (bool) $o['is_correct'],
                ),
                (array) $request->input('options'),
            );

            $q = $this->updateAdminQuestion->execute(new UpdateAdminQuestionInput(
                id: $id,
                level: (int) $request->input('level'),
                questionType: (string) $request->input('question_type'),
                questionText: (string) $request->input('question_text'),
                questionTextJa: $request->input('question_text_ja'),
                explanationJa: $request->input('explanation_ja'),
                status: $request->input('status') ?? 'draft',
                options: $optionInputs,
            ));

            return response()->json(['question' => self::questionToArray($q)]);
        } catch (QuestionNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteAdminQuestion->execute(new DeleteAdminQuestionInput(id: $id));

            return response()->json(status: 204);
        } catch (QuestionNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    private static function questionToArray(object $q): array
    {
        return [
            'id' => $q->id,
            'level' => $q->level,
            'level_label_ja' => $q->levelLabelJa,
            'question_type' => $q->questionType,
            'question_type_label_ja' => $q->questionTypeLabelJa,
            'question_text' => $q->questionText,
            'question_text_ja' => $q->questionTextJa,
            'explanation_ja' => $q->explanationJa,
            'status' => $q->status,
            'status_label_ja' => $q->statusLabelJa,
            'options' => array_map(static fn ($o) => [
                'option_number' => $o->optionNumber,
                'text' => $o->text,
                'text_ja' => $o->textJa,
                'is_correct' => $o->isCorrect,
            ], $q->options),
            'correct_option_number' => $q->correctOptionNumber,
            'created_at' => $q->createdAt,
        ];
    }
}
