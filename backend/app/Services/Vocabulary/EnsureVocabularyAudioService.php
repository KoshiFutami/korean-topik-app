<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

use App\Domain\Vocabulary\Exception\ExampleSentenceMissingForAudioException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Models\Vocabulary;
use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use App\Support\VocabularyAudioUrl;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

/**
 * 公開語彙の音声ファイルを DB・ストレージにキャッシュしつつ、再生用の絶対 URL を返す。
 */
final class EnsureVocabularyAudioService
{
    public function __construct(
        private readonly VocabularySpeechSynthesizerInterface $synthesizer,
    ) {}

    /**
     * @param  bool  $onlyPublished  true のとき status=published の行のみ対象
     *
     * @throws VocabularyNotFoundException
     * @throws Throwable 合成 API 等の失敗時
     */
    public function ensureHttpUrlForId(string $id, bool $onlyPublished): string
    {
        return DB::transaction(function () use ($id, $onlyPublished): string {
            $query = Vocabulary::query()->whereKey($id)->lockForUpdate();
            if ($onlyPublished) {
                $query->where('status', 'published');
            }

            /** @var Vocabulary|null $model */
            $model = $query->first();
            if ($model === null) {
                throw new VocabularyNotFoundException;
            }

            $stored = $model->audio_url !== null ? trim((string) $model->audio_url) : '';
            if ($stored !== '') {
                $looksRelative = ! str_starts_with($stored, 'http://') && ! str_starts_with($stored, 'https://');
                if ($looksRelative) {
                    $disk = Storage::disk((string) config('filesystems.audio_disk', 'public'));
                    if (! $disk->exists($stored)) {
                        $model->audio_url = null;
                        $model->save();
                        $stored = '';
                    } elseif ($disk->size($stored) < 900) {
                        // 旧開発スタブ（約 477B）など実質無音・無効に近いファイルは再合成する
                        $disk->delete($stored);
                        $model->audio_url = null;
                        $model->save();
                        $stored = '';
                    }
                }
            }

            if ($stored !== '') {
                $url = VocabularyAudioUrl::resolveForHttp($stored);
                if ($url === null || $url === '') {
                    throw new RuntimeException('音声 URL の解決に失敗しました。');
                }

                return $url;
            }

            $text = VocabularyTtsSourceText::build($model, false);
            if ($text === '') {
                throw new RuntimeException('合成用テキストが空です。');
            }

            $binary = $this->synthesizer->synthesizeKoreanToMp3($text);
            if ($binary === '') {
                throw new RuntimeException('音声データが空です。');
            }

            $relativePath = 'vocabulary-audio/'.$model->id.'.mp3';
            Storage::disk((string) config('filesystems.audio_disk', 'public'))->put($relativePath, $binary, 'public');
            $model->audio_url = $relativePath;
            $model->save();

            $url = VocabularyAudioUrl::resolveForHttp($relativePath);
            if ($url === null || $url === '') {
                throw new RuntimeException('音声 URL の解決に失敗しました。');
            }

            return $url;
        });
    }

    /**
     * 例文の音声ファイルを DB・ストレージにキャッシュしつつ、再生用の絶対 URL を返す。
     *
     * @throws VocabularyNotFoundException
     * @throws ExampleSentenceMissingForAudioException 例文が空、または合成用テキストが空のとき
     * @throws Throwable 合成 API 等の失敗時
     */
    public function ensureExampleHttpUrlForId(string $id, bool $onlyPublished): string
    {
        return DB::transaction(function () use ($id, $onlyPublished): string {
            $query = Vocabulary::query()->whereKey($id)->lockForUpdate();
            if ($onlyPublished) {
                $query->where('status', 'published');
            }

            /** @var Vocabulary|null $model */
            $model = $query->first();
            if ($model === null) {
                throw new VocabularyNotFoundException;
            }

            $stored = $model->example_audio_url !== null ? trim((string) $model->example_audio_url) : '';
            if ($stored !== '') {
                $looksRelative = ! str_starts_with($stored, 'http://') && ! str_starts_with($stored, 'https://');
                if ($looksRelative) {
                    $disk = Storage::disk((string) config('filesystems.audio_disk', 'public'));
                    if (! $disk->exists($stored)) {
                        $model->example_audio_url = null;
                        $model->save();
                        $stored = '';
                    } elseif ($disk->size($stored) < 900) {
                        $disk->delete($stored);
                        $model->example_audio_url = null;
                        $model->save();
                        $stored = '';
                    }
                }
            }

            if ($stored !== '') {
                $url = VocabularyAudioUrl::resolveForHttp($stored);
                if ($url === null || $url === '') {
                    throw new RuntimeException('例文の音声 URL の解決に失敗しました。');
                }

                return $url;
            }

            $text = VocabularyTtsSourceText::exampleOnly($model);
            if ($text === '') {
                throw new ExampleSentenceMissingForAudioException;
            }

            $binary = $this->synthesizer->synthesizeKoreanToMp3($text);
            if ($binary === '') {
                throw new RuntimeException('例文の音声データが空です。');
            }

            $relativePath = 'vocabulary-audio/'.$model->id.'-example.mp3';
            Storage::disk((string) config('filesystems.audio_disk', 'public'))->put($relativePath, $binary, 'public');
            $model->example_audio_url = $relativePath;
            $model->save();

            $url = VocabularyAudioUrl::resolveForHttp($relativePath);
            if ($url === null || $url === '') {
                throw new RuntimeException('例文の音声 URL の解決に失敗しました。');
            }

            return $url;
        });
    }
}
