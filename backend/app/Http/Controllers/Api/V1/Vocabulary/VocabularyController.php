<?php

namespace App\Http\Controllers\Api\V1\Vocabulary;

use App\Application\User\Vocabulary\GetVocabulary\GetVocabularyInput;
use App\Application\User\Vocabulary\GetVocabulary\GetVocabularyUseCase;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesCard;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesInput;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesUseCase;
use App\Application\User\Vocabulary\ListVocabularies\ListVocabulariesVocabulary;
use App\Domain\Vocabulary\Exception\ExampleSentenceMissingForAudioException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Services\Vocabulary\EnsureVocabularyAudioService;
use App\Support\VocabularyAudioUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

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
            compactList: $request->boolean('compact'),
            q: $request->query('q') !== '' ? $request->query('q') : null,
        ));

        return response()->json([
            'vocabularies' => array_map(static function ($v) {
                if ($v instanceof ListVocabulariesCard) {
                    return [
                        'id' => $v->id,
                        'term' => $v->term,
                        'meaning_ja' => $v->meaningJa,
                        'pos' => $v->pos,
                        'pos_label_ja' => $v->posLabelJa,
                        'level' => $v->level,
                        'level_label_ja' => $v->levelLabelJa,
                        'entry_type' => $v->entryType,
                        'entry_type_label_ja' => $v->entryTypeLabelJa,
                        'audio_url' => VocabularyAudioUrl::resolveForHttp($v->audioUrl),
                    ];
                }

                /** @var ListVocabulariesVocabulary $v */
                return [
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
                    'audio_url' => VocabularyAudioUrl::resolveForHttp($v->audioUrl),
                    'example_audio_url' => VocabularyAudioUrl::resolveForHttp($v->exampleAudioUrl),
                ];
            }, $output->vocabularies),
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
                    'audio_url' => VocabularyAudioUrl::resolveForHttp($v->audioUrl),
                    'example_audio_url' => VocabularyAudioUrl::resolveForHttp($v->exampleAudioUrl),
                ],
            ]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function ensureAudio(string $id): JsonResponse
    {
        try {
            $url = app(EnsureVocabularyAudioService::class)->ensureHttpUrlForId($id, onlyPublished: true);

            return response()->json(['audio_url' => $url]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => '音声の生成に失敗しました。設定やクォータを確認のうえ、しばらくしてから再度お試しください。',
            ], 503);
        }
    }

    public function ensureExampleAudio(string $id): JsonResponse
    {
        try {
            $url = app(EnsureVocabularyAudioService::class)->ensureExampleHttpUrlForId($id, onlyPublished: true);

            return response()->json(['example_audio_url' => $url]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (ExampleSentenceMissingForAudioException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => '音声の生成に失敗しました。設定やクォータを確認のうえ、しばらくしてから再度お試しください。',
            ], 503);
        }
    }
}
