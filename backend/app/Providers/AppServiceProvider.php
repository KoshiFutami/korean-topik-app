<?php

namespace App\Providers;

use App\Application\Admin\Auth\GetMyProfile\GetMyProfileUseCase as GetAdminMyProfileUseCase;
use App\Application\Admin\Auth\LoginAdmin\LoginAdminUseCase;
use App\Application\Admin\Auth\LogoutAdmin\LogoutAdminUseCase;
use App\Application\Shared\Port\PasswordHasherInterface;
use App\Application\Shared\Port\TokenServiceInterface;
use App\Application\User\Auth\GetMyProfile\GetMyProfileUseCase as GetUserMyProfileUseCase;
use App\Application\User\Auth\LoginUser\LoginUserUseCase;
use App\Application\User\Auth\LogoutUser\LogoutUserUseCase;
use App\Application\User\Auth\RegisterUser\RegisterUserUseCase;
use App\Domain\Admin\Repository\AdminRepositoryInterface;
use App\Domain\Bookmark\Repository\BookmarkRepositoryInterface;
use App\Domain\PlannedFeature\Repository\PlannedFeatureRepositoryInterface;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Infrastructure\Admin\Repository\EloquentAdminRepository;
use App\Infrastructure\Admin\Token\SanctumAdminTokenService;
use App\Infrastructure\Bookmark\Repository\EloquentBookmarkRepository;
use App\Infrastructure\PlannedFeature\Repository\EloquentPlannedFeatureRepository;
use App\Infrastructure\Shared\Password\BcryptPasswordHasher;
use App\Infrastructure\User\Repository\EloquentUserRepository;
use App\Infrastructure\User\Token\SanctumUserTokenService;
use App\Infrastructure\Vocabulary\Repository\EloquentVocabularyRepository;
use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use App\Services\Vocabulary\GoogleCloudVocabularySpeechSynthesizer;
use App\Services\Vocabulary\StubMp3VocabularySpeechSynthesizer;
use App\Services\Vocabulary\UnavailableGoogleSpeechSynthesizer;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(AdminRepositoryInterface::class, EloquentAdminRepository::class);
        $this->app->bind(VocabularyRepositoryInterface::class, EloquentVocabularyRepository::class);
        $this->app->bind(BookmarkRepositoryInterface::class, EloquentBookmarkRepository::class);
        $this->app->bind(PlannedFeatureRepositoryInterface::class, EloquentPlannedFeatureRepository::class);
        $this->app->bind(PasswordHasherInterface::class, BcryptPasswordHasher::class);

        $ttsClientClass = 'Google\\Cloud\\TextToSpeech\\V1\\Client\\TextToSpeechClient';

        if ($this->app->environment('testing')) {
            $this->app->singleton(VocabularySpeechSynthesizerInterface::class, UnavailableGoogleSpeechSynthesizer::class);
        } elseif (class_exists($ttsClientClass) && $this->googleTextToSpeechCredentialsAreReadable()) {
            $this->app->singleton($ttsClientClass, function () use ($ttsClientClass): object {
                $credentials = $this->resolvedGoogleApplicationCredentialsPath();
                if ($credentials === null) {
                    throw new \LogicException('Google TTS 用クレデンシャルパスが解決できません。');
                }

                return new $ttsClientClass([
                    'transport' => 'rest',
                    'credentials' => $credentials,
                ]);
            });

            $this->app->singleton(VocabularySpeechSynthesizerInterface::class, function ($app) use ($ttsClientClass): GoogleCloudVocabularySpeechSynthesizer {
                return new GoogleCloudVocabularySpeechSynthesizer(
                    $app->make($ttsClientClass),
                    (string) config('services.google.text_to_speech.language_code'),
                    (string) config('services.google.text_to_speech.voice'),
                );
            });
        } elseif (class_exists($ttsClientClass)) {
            $this->app->singleton(VocabularySpeechSynthesizerInterface::class, StubMp3VocabularySpeechSynthesizer::class);
        } else {
            $this->app->singleton(VocabularySpeechSynthesizerInterface::class, UnavailableGoogleSpeechSynthesizer::class);
        }

        $this->app->when([
            RegisterUserUseCase::class,
            LoginUserUseCase::class,
            LogoutUserUseCase::class,
            GetUserMyProfileUseCase::class,
        ])->needs(TokenServiceInterface::class)->give(SanctumUserTokenService::class);

        $this->app->when([
            LoginAdminUseCase::class,
            LogoutAdminUseCase::class,
            GetAdminMyProfileUseCase::class,
        ])->needs(TokenServiceInterface::class)->give(SanctumAdminTokenService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }

    private function googleTextToSpeechCredentialsAreReadable(): bool
    {
        return $this->resolvedGoogleApplicationCredentialsPath() !== null;
    }

    /**
     * 読み取り可能なサービスアカウント JSON の絶対パス。未設定・不存在なら null。
     * Docker ではホストのパスではなくコンテナ内パス（例: /var/www/html/storage/credentials/...）を指定する。
     */
    private function resolvedGoogleApplicationCredentialsPath(): ?string
    {
        $raw = trim((string) config('services.google.text_to_speech.credentials_path'));
        if ($raw === '') {
            $raw = trim((string) (getenv('GOOGLE_APPLICATION_CREDENTIALS') ?: ''));
        }
        if ($raw === '') {
            return null;
        }

        $path = $this->absoluteCredentialsPath($raw);
        if ($path === '' || ! is_file($path) || ! is_readable($path)) {
            return null;
        }

        return $path;
    }

    /**
     * php -S のカレントが public/ でも、相対パスは常にアプリルート（backend/）基準で解決する。
     */
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
}
