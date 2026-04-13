<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Audio Storage Disk
    |--------------------------------------------------------------------------
    |
    | 語彙音声 MP3 の保存先ディスク。ローカル開発は 'public'（local driver）、
    | Railway 等の本番環境では 'audio_s3'（S3 driver）を推奨。
    | 環境変数 AUDIO_STORAGE_DISK で切り替える。
    |
    */
    'audio_disk' => env('AUDIO_STORAGE_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost:8000'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

        // 語彙音声 MP3 の本番用 GCS ディスク（AUDIO_STORAGE_DISK=audio_gcs で有効化）
        // 認証方法（どちらか一方を設定する）:
        //   GOOGLE_CREDENTIALS_B64: base64 エンコードした JSON（Railway 等エフェメラル環境向け、TTS と共用可）
        //   GOOGLE_APPLICATION_CREDENTIALS: サービスアカウント JSON ファイルのパス（Docker 等の永続ファイルシステム向け）
        'audio_gcs' => [
            'driver' => 'gcs',
            'key_file_path' => env('GOOGLE_APPLICATION_CREDENTIALS'),
            'bucket' => env('GCS_AUDIO_BUCKET'),
            'path_prefix' => env('GCS_AUDIO_PATH_PREFIX', ''),
            // NOTE:
            // UBLA（Uniform bucket-level access）有効なバケットでは object ACL（legacy ACL）が禁止される。
            // Flysystem 側で visibility=public が legacy ACL を要求して 400 になることがあるため、
            // ここでは visibility を指定しない（公開アクセスはバケット IAM で制御する）。
            'throw' => false,
            'report' => false,
        ],

        // 語彙音声 MP3 の本番用 S3 ディスク（AUDIO_STORAGE_DISK=audio_s3 で有効化）
        'audio_s3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
