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

    private function putAudioBinary(string $relativePath, string $binary): void
    {
        $diskName = (string) config('filesystems.audio_disk', 'public');
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        // GCS（UBLA 有効）では Flysystem 側が legacy ACL を付与して 400 になることがあるため、
        // 音声アップロードは StorageClient で直接行い、ACL を指定しない。
        $storageClientClass = 'Google\\Cloud\\Storage\\StorageClient';
        if ($driver === 'gcs' && class_exists($storageClientClass)) {
            $credentialsArray = $this->decodedGoogleCredentialsB64();

            $clientOptions = [];
            if ($credentialsArray !== null) {
                $clientOptions['keyFile'] = $credentialsArray;
            } else {
                $keyFilePath = trim((string) config("filesystems.disks.{$diskName}.key_file_path", ''));
                if ($keyFilePath !== '') {
                    $clientOptions['keyFilePath'] = $this->absoluteCredentialsPath($keyFilePath);
                }
            }

            $bucketName = trim((string) config("filesystems.disks.{$diskName}.bucket", ''));
            if ($bucketName === '') {
                throw new RuntimeException('GCS バケット名が未設定です。');
            }

            $prefix = trim((string) config("filesystems.disks.{$diskName}.path_prefix", ''), '/');
            $objectName = ($prefix !== '') ? ($prefix.'/'.ltrim($relativePath, '/')) : ltrim($relativePath, '/');

            /** @var object $client */
            $client = new $storageClientClass($clientOptions);
            $bucket = $client->bucket($bucketName);
            $bucket->upload($binary, [
                'name' => $objectName,
                'metadata' => [
                    'contentType' => 'audio/mpeg',
                ],
                // Do NOT set predefinedAcl under UBLA.
            ]);

            return;
        }

        $disk = Storage::disk($diskName);

        if ($driver === 'local') {
            $disk->put($relativePath, $binary, 'public');

            return;
        }

        // S3 等は bucket policy / IAM で公開を制御する想定。ここでは ACL 指定を避ける。
        $disk->put($relativePath, $binary);
    }

    private function decodedGoogleCredentialsB64(): ?array
    {
        $b64 = trim((string) (getenv('GOOGLE_CREDENTIALS_B64') ?: ''));
        if ($b64 === '') {
            return null;
        }
        $json = base64_decode($b64, true);
        if ($json === false) {
            return null;
        }
        $decoded = json_decode($json, true);

        return is_array($decoded) ? $decoded : null;
    }

    private function absoluteCredentialsPath(string $raw): string
    {
        $trimmed = trim($raw);
        if ($trimmed === '') {
            return '';
        }

        if (str_starts_with($trimmed, '/')) {
            return $trimmed;
        }

        return base_path($trimmed);
    }

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
            $this->putAudioBinary($relativePath, $binary);
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
            $this->putAudioBinary($relativePath, $binary);
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
