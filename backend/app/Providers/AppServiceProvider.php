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
use Google\Cloud\TextToSpeech\V1\Client\TextToSpeechClient;
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

        $this->app->singleton(TextToSpeechClient::class, function (): TextToSpeechClient {
            return new TextToSpeechClient([
                'transport' => 'rest',
            ]);
        });

        $this->app->singleton(VocabularySpeechSynthesizerInterface::class, function ($app): GoogleCloudVocabularySpeechSynthesizer {
            return new GoogleCloudVocabularySpeechSynthesizer(
                $app->make(TextToSpeechClient::class),
                (string) config('services.google.text_to_speech.language_code'),
                (string) config('services.google.text_to_speech.voice'),
            );
        });

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
}
