<?php

declare(strict_types=1);

namespace App\Services\User;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * プロフィール画像を GCS（または local）にアップロード・削除するサービス。
 * EnsureVocabularyAudioService.putAudioBinary() と同じパターンで UBLA 有効 GCS に対応する。
 */
final class ProfileImageService
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    private const MIME_TO_EXT = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];

    /**
     * 画像をアップロードし、DB に保存するための相対パスを返す。
     * 既存のパスが異なる場合は古いファイルを削除する。
     *
     * @param  string  $userId  ユーザー ID（ファイル名のプレフィックスに使用）
     * @param  UploadedFile  $file  アップロードされた画像ファイル
     * @param  string|null  $oldPath  DB に保存されている古いパス（あれば削除する）
     * @return string 新しい相対パス（DB 保存用）
     */
    public function upload(string $userId, UploadedFile $file, ?string $oldPath): string
    {
        $mimeType = $file->getMimeType() ?? '';
        if (! in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new RuntimeException('サポートされていない画像形式です。JPEG, PNG, GIF, WebP のいずれかを使用してください。');
        }

        $ext = self::MIME_TO_EXT[$mimeType] ?? 'jpg';
        $uniqueId = (string) Str::ulid();
        $relativePath = "profile-images/{$userId}/{$uniqueId}.{$ext}";

        $binary = $file->get();
        if ($binary === false || $binary === '') {
            throw new RuntimeException('画像ファイルの読み込みに失敗しました。');
        }

        $this->putBinary($relativePath, $binary, $mimeType);

        // 古いファイルを削除（パスが異なる場合のみ）
        if ($oldPath !== null && $oldPath !== '' && $oldPath !== $relativePath) {
            $this->delete($oldPath);
        }

        return $relativePath;
    }

    /**
     * 指定されたパスの画像ファイルを削除する。
     */
    public function delete(string $relativePath): void
    {
        if ($relativePath === '') {
            return;
        }

        $diskName = $this->diskName();
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        $storageClientClass = 'Google\\Cloud\\Storage\\StorageClient';
        if ($driver === 'gcs' && class_exists($storageClientClass)) {
            $clientOptions = $this->gcsClientOptions($diskName);
            $bucketName = trim((string) config("filesystems.disks.{$diskName}.bucket", ''));
            if ($bucketName === '') {
                return;
            }

            $prefix = trim((string) config("filesystems.disks.{$diskName}.path_prefix", ''), '/');
            $objectName = ($prefix !== '') ? ($prefix.'/'.ltrim($relativePath, '/')) : ltrim($relativePath, '/');

            /** @var object $client */
            $client = new $storageClientClass($clientOptions);
            $bucket = $client->bucket($bucketName);
            $object = $bucket->object($objectName);
            if ($object->exists()) {
                $object->delete();
            }

            return;
        }

        Storage::disk($diskName)->delete($relativePath);
    }

    private function putBinary(string $relativePath, string $binary, string $contentType): void
    {
        $diskName = $this->diskName();
        $driver = (string) (config("filesystems.disks.{$diskName}.driver") ?? 'local');

        // GCS（UBLA 有効）では Flysystem 側が legacy ACL を付与して 400 になることがあるため、
        // StorageClient で直接アップロードし、ACL を指定しない。
        $storageClientClass = 'Google\\Cloud\\Storage\\StorageClient';
        if ($driver === 'gcs' && class_exists($storageClientClass)) {
            $clientOptions = $this->gcsClientOptions($diskName);
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
                    'contentType' => $contentType,
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

        $disk->put($relativePath, $binary);
    }

    private function diskName(): string
    {
        return (string) config('filesystems.profile_image_disk', 'public');
    }

    private function gcsClientOptions(string $diskName): array
    {
        $b64 = trim((string) (getenv('GOOGLE_CREDENTIALS_B64') ?: ''));
        if ($b64 !== '') {
            $json = base64_decode($b64, true);
            if ($json !== false) {
                $decoded = json_decode($json, true);
                if (is_array($decoded)) {
                    return ['keyFile' => $decoded];
                }
            }
        }

        $keyFilePath = trim((string) config("filesystems.disks.{$diskName}.key_file_path", ''));
        if ($keyFilePath !== '') {
            $absolutePath = str_starts_with($keyFilePath, '/') ? $keyFilePath : base_path($keyFilePath);

            return ['keyFilePath' => $absolutePath];
        }

        return [];
    }
}
