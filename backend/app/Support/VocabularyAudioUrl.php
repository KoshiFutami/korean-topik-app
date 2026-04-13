<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * DB に保存された音声パス（audio ディスク相対）を、クライアントが取得できる絶対 URL に変換する。
 * ローカル開発は 'public' ディスク、本番は 'audio_gcs'（GCS）または 'audio_s3'（S3）を使用する
 * （AUDIO_STORAGE_DISK 環境変数で切り替え）。
 */
final class VocabularyAudioUrl
{
    private static function audioDiskName(): string
    {
        return (string) config('filesystems.audio_disk', 'public');
    }

    private static function gcsPublicUrl(string $stored): ?string
    {
        $bucket = trim((string) config('filesystems.disks.audio_gcs.bucket', ''));
        if ($bucket === '') {
            return null;
        }

        $prefix = (string) (config('filesystems.disks.audio_gcs.path_prefix') ?? '');
        $prefix = trim($prefix, '/');

        $path = ltrim($stored, '/');
        $fullPath = ($prefix !== '') ? ($prefix.'/'.$path) : $path;

        // Google Cloud Storage public URL format:
        // https://storage.googleapis.com/<bucket>/<object>
        // Keep "/" separators but encode path segments.
        $encoded = implode('/', array_map('rawurlencode', explode('/', $fullPath)));

        return 'https://storage.googleapis.com/'.rawurlencode($bucket).'/'.$encoded;
    }

    public static function resolveForHttp(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }

        if (str_starts_with($stored, 'http://') || str_starts_with($stored, 'https://')) {
            return $stored;
        }

        $diskName = self::audioDiskName();
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        try {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk($diskName);
            $url = $disk->url($stored);
        } catch (Throwable) {
            // Some custom disks (e.g. GCS via Flysystem adapter) may not support url().
            $url = '';
        }

        if ($url === '' && $driver === 'gcs') {
            return self::gcsPublicUrl($stored);
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return rtrim((string) config('app.url'), '/').(str_starts_with($url, '/') ? $url : '/'.$url);
    }

    /**
     * resolveForHttp と同様だが、ローカルディスクの場合はファイルの存在とサイズ（≥ 900B）も検証する。
     * 存在しない・小さすぎる（旧スタブ相当）ファイルは null を返し、
     * クライアントに ensureAudio を呼ばせて再生成を促す。
     * GCS・S3 等のクラウドディスクでは API コストを避けるため検証をスキップし、DB 値を信頼する。
     * API レスポンスのシリアライズ時（一覧・詳細・ブックマーク等）に使用する。
     */
    public static function resolveIfValidForHttp(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }

        if (str_starts_with($stored, 'http://') || str_starts_with($stored, 'https://')) {
            return $stored;
        }

        $diskName = self::audioDiskName();
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        if ($driver === 'local') {
            $disk = Storage::disk($diskName);
            if (! $disk->exists($stored) || $disk->size($stored) < 900) {
                return null;
            }
        }

        return self::resolveForHttp($stored);
    }
}
