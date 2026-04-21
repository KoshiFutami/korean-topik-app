<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * DB に保存されたプロフィール画像パスを、クライアントが取得できる絶対 URL に変換する。
 * ローカル開発は 'public' ディスク、本番は 'profile_image_gcs'（GCS）を使用する
 * （PROFILE_IMAGE_STORAGE_DISK 環境変数で切り替え）。
 */
final class ProfileImageUrl
{
    private static function diskName(): string
    {
        return (string) config('filesystems.profile_image_disk', 'public');
    }

    private static function gcsPublicUrl(string $stored): ?string
    {
        $bucket = trim((string) config('filesystems.disks.profile_image_gcs.bucket', ''));
        if ($bucket === '') {
            return null;
        }

        $prefix = (string) (config('filesystems.disks.profile_image_gcs.path_prefix') ?? '');
        $prefix = trim($prefix, '/');

        $path = ltrim($stored, '/');
        $fullPath = ($prefix !== '') ? ($prefix.'/'.$path) : $path;

        // Google Cloud Storage public URL format:
        // https://storage.googleapis.com/<bucket>/<object>
        $encoded = implode('/', array_map('rawurlencode', explode('/', $fullPath)));

        return 'https://storage.googleapis.com/'.rawurlencode($bucket).'/'.$encoded;
    }

    public static function resolve(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }

        if (str_starts_with($stored, 'http://') || str_starts_with($stored, 'https://')) {
            return $stored;
        }

        $diskName = self::diskName();
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        try {
            $disk = Storage::disk($diskName);
            $url = $disk->url($stored);
        } catch (Throwable) {
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
}
