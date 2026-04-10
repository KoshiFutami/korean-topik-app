<?php

namespace App\Http\Controllers\Api\V1\Admin\Vocabulary;

use App\Application\Admin\Vocabulary\CreateVocabulary\CreateVocabularyInput;
use App\Application\Admin\Vocabulary\CreateVocabulary\CreateVocabularyUseCase;
use App\Application\Admin\Vocabulary\DeleteVocabulary\DeleteVocabularyInput;
use App\Application\Admin\Vocabulary\DeleteVocabulary\DeleteVocabularyUseCase;
use App\Application\Admin\Vocabulary\GetVocabulary\GetVocabularyInput;
use App\Application\Admin\Vocabulary\GetVocabulary\GetVocabularyUseCase;
use App\Application\Admin\Vocabulary\ListVocabularies\ListVocabulariesUseCase;
use App\Application\Admin\Vocabulary\UpdateVocabulary\UpdateVocabularyInput;
use App\Application\Admin\Vocabulary\UpdateVocabulary\UpdateVocabularyUseCase;
use App\Domain\Vocabulary\Exception\VocabularyAlreadyExistsException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Vocabulary\StoreVocabularyRequest;
use App\Http\Requests\Api\V1\Admin\Vocabulary\UpdateVocabularyRequest;
use Illuminate\Http\JsonResponse;

class VocabularyController extends Controller
{
    public function __construct(
        private readonly ListVocabulariesUseCase $listVocabularies,
        private readonly GetVocabularyUseCase $getVocabulary,
        private readonly CreateVocabularyUseCase $createVocabulary,
        private readonly UpdateVocabularyUseCase $updateVocabulary,
        private readonly DeleteVocabularyUseCase $deleteVocabulary,
    ) {}

    public function index(): JsonResponse
    {
        $output = $this->listVocabularies->execute();

        return response()->json([
            'vocabularies' => array_map(static fn ($v) => [
                'id' => $v->id,
                'term' => $v->term,
                'meaning_ja' => $v->meaningJa,
                'pos' => $v->pos,
                'level' => $v->level,
                'example_sentence' => $v->exampleSentence,
                'example_translation_ja' => $v->exampleTranslationJa,
                'audio_url' => $v->audioUrl,
                'status' => $v->status,
                'created_at' => $v->createdAt,
            ], $output->vocabularies),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $v = $this->getVocabulary->execute(new GetVocabularyInput(id: $id));

            return response()->json([
                'vocabulary' => [
                    'id' => $v->id,
                    'term' => $v->term,
                    'meaning_ja' => $v->meaningJa,
                    'pos' => $v->pos,
                    'level' => $v->level,
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => $v->audioUrl,
                    'status' => $v->status,
                    'created_at' => $v->createdAt,
                ],
            ]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function store(StoreVocabularyRequest $request): JsonResponse
    {
        try {
            $v = $this->createVocabulary->execute(new CreateVocabularyInput(
                term: (string) $request->input('term'),
                meaningJa: (string) $request->input('meaning_ja'),
                pos: (string) $request->input('pos'),
                level: (int) $request->input('level'),
                exampleSentence: $request->input('example_sentence'),
                exampleTranslationJa: $request->input('example_translation_ja'),
                audioUrl: $request->input('audio_url'),
                status: $request->input('status'),
            ));

            return response()->json([
                'vocabulary' => [
                    'id' => $v->id,
                    'term' => $v->term,
                    'meaning_ja' => $v->meaningJa,
                    'pos' => $v->pos,
                    'level' => $v->level,
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => $v->audioUrl,
                    'status' => $v->status,
                    'created_at' => $v->createdAt,
                ],
            ], 201);
        } catch (VocabularyAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function update(UpdateVocabularyRequest $request, string $id): JsonResponse
    {
        try {
            $v = $this->updateVocabulary->execute(new UpdateVocabularyInput(
                id: $id,
                term: (string) $request->input('term'),
                meaningJa: (string) $request->input('meaning_ja'),
                pos: (string) $request->input('pos'),
                level: (int) $request->input('level'),
                exampleSentence: $request->input('example_sentence'),
                exampleTranslationJa: $request->input('example_translation_ja'),
                audioUrl: $request->input('audio_url'),
                status: $request->input('status'),
            ));

            return response()->json([
                'vocabulary' => [
                    'id' => $v->id,
                    'term' => $v->term,
                    'meaning_ja' => $v->meaningJa,
                    'pos' => $v->pos,
                    'level' => $v->level,
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => $v->audioUrl,
                    'status' => $v->status,
                    'created_at' => $v->createdAt,
                ],
            ]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (VocabularyAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteVocabulary->execute(new DeleteVocabularyInput(id: $id));

            return response()->json(status: 204);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}

