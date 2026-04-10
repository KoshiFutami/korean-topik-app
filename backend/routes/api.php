<?php

use App\Http\Controllers\Api\V1\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\Vocabulary\VocabularyController;
use App\Http\Controllers\Api\V1\Auth\UserAuthController;
use App\Http\Controllers\Api\V1\Vocabulary\VocabularyController as UserVocabularyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [UserAuthController::class, 'register']);
        Route::post('/login', [UserAuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('/logout', [UserAuthController::class, 'logout']);
            Route::get('/me', [UserAuthController::class, 'me']);
        });
    });

    // Public: allow guest to browse published vocabularies.
    Route::get('/vocabularies', [UserVocabularyController::class, 'index']);
    Route::get('/vocabularies/{id}', [UserVocabularyController::class, 'show']);

    Route::prefix('admin/auth')->group(function (): void {
        Route::post('/login', [AdminAuthController::class, 'login']);

        Route::middleware('auth:admin')->group(function (): void {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/me', [AdminAuthController::class, 'me']);
        });
    });

    Route::prefix('admin')->middleware('auth:admin')->group(function (): void {
        Route::apiResource('vocabularies', VocabularyController::class);
    });
});
