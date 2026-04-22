<?php

use App\Http\Controllers\Api\V1\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\Question\QuestionController as AdminQuestionController;
use App\Http\Controllers\Api\V1\Admin\Vocabulary\VocabularyController;
use App\Http\Controllers\Api\V1\Auth\UserAuthController;
use App\Http\Controllers\Api\V1\PlannedFeature\PlannedFeatureController;
use App\Http\Controllers\Api\V1\Question\QuestionController;
use App\Http\Controllers\Api\V1\User\BookmarkController;
use App\Http\Controllers\Api\V1\Vocabulary\VocabularyController as UserVocabularyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [UserAuthController::class, 'register']);
        Route::post('/login', [UserAuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('/logout', [UserAuthController::class, 'logout']);
            Route::get('/me', [UserAuthController::class, 'me']);
            Route::patch('/me', [UserAuthController::class, 'updateProfile']);
            Route::post('/me/profile-image', [UserAuthController::class, 'uploadProfileImage']);
            Route::patch('/me/profile-image/position', [UserAuthController::class, 'updateProfileImagePosition']);
        });
    });

    // Public: allow guest to browse published vocabularies.
    Route::get('/vocabularies', [UserVocabularyController::class, 'index']);
    Route::get('/vocabularies/{id}', [UserVocabularyController::class, 'show']);
    Route::post('/vocabularies/{id}/audio', [UserVocabularyController::class, 'ensureAudio'])
        ->middleware('throttle:30,1');
    Route::post('/vocabularies/{id}/audio/example', [UserVocabularyController::class, 'ensureExampleAudio'])
        ->middleware('throttle:30,1');

    Route::get('/planned-features', [PlannedFeatureController::class, 'index']);
    Route::get('/questions', [QuestionController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/bookmarks', [BookmarkController::class, 'store']);
        Route::delete('/bookmarks/{vocabularyId}', [BookmarkController::class, 'destroy']);
    });

    Route::prefix('admin/auth')->group(function (): void {
        Route::post('/login', [AdminAuthController::class, 'login']);

        Route::middleware('auth:admin')->group(function (): void {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/me', [AdminAuthController::class, 'me']);
        });
    });

    Route::prefix('admin')->middleware('auth:admin')->group(function (): void {
        Route::post('vocabularies/{id}/audio', [VocabularyController::class, 'ensureAudio'])
            ->middleware('throttle:60,1');
        Route::post('vocabularies/{id}/audio/example', [VocabularyController::class, 'ensureExampleAudio'])
            ->middleware('throttle:60,1');
        Route::post('vocabularies/import', [VocabularyController::class, 'importCsv']);
        Route::apiResource('vocabularies', VocabularyController::class);
        Route::apiResource('questions', AdminQuestionController::class);
    });
});
