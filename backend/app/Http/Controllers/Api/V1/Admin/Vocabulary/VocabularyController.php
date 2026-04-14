<?php

namespace App\Http\Controllers\Api\V1\Admin\Vocabulary;

use App\Application\Admin\Vocabulary\BulkUpsertVocabularies\BulkUpsertVocabulariesInput;
use App\Application\Admin\Vocabulary\BulkUpsertVocabularies\BulkUpsertVocabulariesUseCase;
use App\Application\Admin\Vocabulary\CreateVocabulary\CreateVocabularyInput;
use App\Application\Admin\Vocabulary\CreateVocabulary\CreateVocabularyUseCase;
use App\Application\Admin\Vocabulary\DeleteVocabulary\DeleteVocabularyInput;
use App\Application\Admin\Vocabulary\DeleteVocabulary\DeleteVocabularyUseCase;
use App\Application\Admin\Vocabulary\GetVocabulary\GetVocabularyInput;
use App\Application\Admin\Vocabulary\GetVocabulary\GetVocabularyUseCase;
use App\Application\Admin\Vocabulary\ListVocabularies\ListVocabulariesUseCase;
use App\Application\Admin\Vocabulary\UpdateVocabulary\UpdateVocabularyInput;
use App\Application\Admin\Vocabulary\UpdateVocabulary\UpdateVocabularyUseCase;
use App\Domain\Vocabulary\Exception\ExampleSentenceMissingForAudioException;
use App\Domain\Vocabulary\Exception\VocabularyAlreadyExistsException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Vocabulary\ImportVocabularyCsvRequest;
use App\Http\Requests\Api\V1\Admin\Vocabulary\StoreVocabularyRequest;
use App\Http\Requests\Api\V1\Admin\Vocabulary\UpdateVocabularyRequest;
use App\Services\Vocabulary\EnsureVocabularyAudioService;
use App\Support\VocabularyAudioUrl;
use Illuminate\Http\JsonResponse;
use Throwable;

class VocabularyController extends Controller
{
    public function __construct(
        private readonly ListVocabulariesUseCase $listVocabularies,
        private readonly GetVocabularyUseCase $getVocabulary,
        private readonly CreateVocabularyUseCase $createVocabulary,
        private readonly UpdateVocabularyUseCase $updateVocabulary,
        private readonly DeleteVocabularyUseCase $deleteVocabulary,
        private readonly BulkUpsertVocabulariesUseCase $bulkUpsertVocabularies,
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
                'pos_label_ja' => PartOfSpeech::from($v->pos)->labelJa(),
                'level' => $v->level,
                'level_label_ja' => TopikLevel::from($v->level)->labelJa(),
                'entry_type' => $v->entryType,
                'entry_type_label_ja' => EntryType::from($v->entryType)->labelJa(),
                'example_sentence' => $v->exampleSentence,
                'example_translation_ja' => $v->exampleTranslationJa,
                'audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->audioUrl),
                'example_audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->exampleAudioUrl),
                'status' => $v->status,
                'status_label_ja' => VocabularyStatus::from($v->status)->labelJa(),
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
                    'pos_label_ja' => PartOfSpeech::from($v->pos)->labelJa(),
                    'level' => $v->level,
                    'level_label_ja' => TopikLevel::from($v->level)->labelJa(),
                    'entry_type' => $v->entryType,
                    'entry_type_label_ja' => EntryType::from($v->entryType)->labelJa(),
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->audioUrl),
                    'example_audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->exampleAudioUrl),
                    'status' => $v->status,
                    'status_label_ja' => VocabularyStatus::from($v->status)->labelJa(),
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
                entryType: $request->input('entry_type'),
                exampleSentence: $request->input('example_sentence'),
                exampleTranslationJa: $request->input('example_translation_ja'),
                audioUrl: $request->input('audio_url'),
                exampleAudioUrl: $request->input('example_audio_url'),
                status: $request->input('status'),
            ));

            return response()->json([
                'vocabulary' => [
                    'id' => $v->id,
                    'term' => $v->term,
                    'meaning_ja' => $v->meaningJa,
                    'pos' => $v->pos,
                    'pos_label_ja' => PartOfSpeech::from($v->pos)->labelJa(),
                    'level' => $v->level,
                    'level_label_ja' => TopikLevel::from($v->level)->labelJa(),
                    'entry_type' => $v->entryType,
                    'entry_type_label_ja' => EntryType::from($v->entryType)->labelJa(),
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->audioUrl),
                    'example_audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->exampleAudioUrl),
                    'status' => $v->status,
                    'status_label_ja' => VocabularyStatus::from($v->status)->labelJa(),
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
                entryType: $request->input('entry_type'),
                exampleSentence: $request->input('example_sentence'),
                exampleTranslationJa: $request->input('example_translation_ja'),
                audioUrl: $request->input('audio_url'),
                exampleAudioUrl: $request->input('example_audio_url'),
                status: $request->input('status'),
            ));

            return response()->json([
                'vocabulary' => [
                    'id' => $v->id,
                    'term' => $v->term,
                    'meaning_ja' => $v->meaningJa,
                    'pos' => $v->pos,
                    'pos_label_ja' => PartOfSpeech::from($v->pos)->labelJa(),
                    'level' => $v->level,
                    'level_label_ja' => TopikLevel::from($v->level)->labelJa(),
                    'entry_type' => $v->entryType,
                    'entry_type_label_ja' => EntryType::from($v->entryType)->labelJa(),
                    'example_sentence' => $v->exampleSentence,
                    'example_translation_ja' => $v->exampleTranslationJa,
                    'audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->audioUrl),
                    'example_audio_url' => VocabularyAudioUrl::resolveIfValidForHttp($v->exampleAudioUrl),
                    'status' => $v->status,
                    'status_label_ja' => VocabularyStatus::from($v->status)->labelJa(),
                    'created_at' => $v->createdAt,
                ],
            ]);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (VocabularyAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function ensureAudio(string $id): JsonResponse
    {
        try {
            $url = app(EnsureVocabularyAudioService::class)->ensureHttpUrlForId($id, onlyPublished: false);

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
            $url = app(EnsureVocabularyAudioService::class)->ensureExampleHttpUrlForId($id, onlyPublished: false);

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

    public function importCsv(ImportVocabularyCsvRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $content = file_get_contents($file->getRealPath());
        if ($content === false) {
            return response()->json(['message' => 'ファイルの読み込みに失敗しました。'], 422);
        }

        // Strip UTF-8 BOM if present
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
        }

        $validPos = ['noun', 'verb', 'adj', 'adv', 'particle', 'determiner', 'pronoun', 'interjection', 'other'];
        $validEntryTypes = ['word', 'phrase', 'idiom'];
        $validStatuses = ['draft', 'published', 'archived'];

        $rows = [];
        $lineNumber = 0;
        foreach (explode("\n", $content) as $line) {
            $lineNumber++;
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = str_getcsv($line);

            // Skip header row
            if (($parts[0] ?? '') === 'term') {
                continue;
            }

            if (count($parts) < 4) {
                return response()->json([
                    'message' => "行 {$lineNumber}: カラム数が不足しています（term, meaning_ja, pos, level は必須）。",
                ], 422);
            }

            [$term, $meaningJa, $pos, $level] = $parts;
            $entryType = isset($parts[4]) && $parts[4] !== '' ? $parts[4] : 'word';
            $exampleSentence = isset($parts[5]) && $parts[5] !== '' ? $parts[5] : null;
            $exampleTranslationJa = isset($parts[6]) && $parts[6] !== '' ? $parts[6] : null;
            $status = isset($parts[7]) && $parts[7] !== '' ? $parts[7] : 'published';

            $term = trim($term);
            $meaningJa = trim($meaningJa);
            $pos = trim($pos);
            $level = (int) trim($level);
            $entryType = trim($entryType);
            $status = trim($status);

            if ($term === '' || $meaningJa === '') {
                return response()->json([
                    'message' => "行 {$lineNumber}: term と meaning_ja は必須です。",
                ], 422);
            }

            if (! in_array($pos, $validPos, true)) {
                return response()->json([
                    'message' => "行 {$lineNumber}: pos の値が不正です（{$pos}）。有効な値: ".implode(', ', $validPos),
                ], 422);
            }

            if ($level < 1 || $level > 6) {
                return response()->json([
                    'message' => "行 {$lineNumber}: level は 1 〜 6 の整数で指定してください。",
                ], 422);
            }

            if (! in_array($entryType, $validEntryTypes, true)) {
                return response()->json([
                    'message' => "行 {$lineNumber}: entry_type の値が不正です（{$entryType}）。有効な値: ".implode(', ', $validEntryTypes),
                ], 422);
            }

            if (! in_array($status, $validStatuses, true)) {
                return response()->json([
                    'message' => "行 {$lineNumber}: status の値が不正です（{$status}）。有効な値: ".implode(', ', $validStatuses),
                ], 422);
            }

            $rows[] = [
                'term' => $term,
                'meaning_ja' => $meaningJa,
                'pos' => $pos,
                'level' => $level,
                'entry_type' => $entryType,
                'example_sentence' => $exampleSentence,
                'example_translation_ja' => $exampleTranslationJa,
                'status' => $status,
            ];
        }

        if ($rows === []) {
            return response()->json(['message' => 'インポートするデータがありません。'], 422);
        }

        $output = $this->bulkUpsertVocabularies->execute(new BulkUpsertVocabulariesInput(rows: $rows));

        return response()->json([
            'created' => $output->created,
            'updated' => $output->updated,
        ]);
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
