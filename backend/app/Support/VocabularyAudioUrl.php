<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * DB に保存された音声パス（public ディスク相対）を、クライアントが取得できる絶対 URL に変換する。
 */
final class VocabularyAudioUrl
{
    public static function resolveForHttp(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }

        if (str_starts_with($stored, 'http://') || str_starts_with($stored, 'https://')) {
            return $stored;
        }

        $url = Storage::disk('public')->url($stored);
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return rtrim((string) config('app.url'), '/').(str_starts_with($url, '/') ? $url : '/'.$url);
    }
}
