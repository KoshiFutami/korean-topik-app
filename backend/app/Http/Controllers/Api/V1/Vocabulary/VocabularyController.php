<?php

namespace App\Http\Controllers\Api\V1\Vocabulary;

use App\Application\User\Vocabulary\GetVocabulary\GetVocabularyInput;
use App\Application\User\Vocabulary\GetVocabulary\GetVocabularyUseCase;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesInput;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesUseCase;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VocabularyController
{
    public function __construct(
        private readonly ListVocabulariesUseCase $listVocabularies,
        private readonly GetVocabularyUseCase $getVocabulary,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $output = $this->listVocabularies->execute(new ListVocabulariesInput(
            level: $request->query('level') !== null ? (int) $request->query('level') : null,
            entryType: $request->query('entry_type'),
            pos: $request->query('pos'),
        ));

        return response()->json([
            'vocabularies' => array_map(static fn ($v) => [
                'id' => $v->id,
                'term' => $v->term,
                'meaning_ja' => $v->meaningJa,
                'pos' => $v->pos,
                'pos_label_ja' => $v->posLabelJa,
                'level' => $v->level,
                'level_label_ja' => $v->levelLabelJa,
                'entry_type' => $v->entryType,
                'entry_type_label_ja' => $v->entryTypeLabelJa,
                'example_sentence' => $v->exampleSentence,
                'example_translation_ja' => $v->exampleTranslationJa,
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
                    'pos_label_ja' => $v->posLabelJa,
                    'level' => $v->level,
                    'level_label_ja' => $v->levelLabelJa,
                    'entry_type' => $v->entryType,
                    'entry_type_label_ja' => $v->entryTypeLabelJa,
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => $v->audioUrl,
                ],
            ]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
