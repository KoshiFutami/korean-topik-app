<?php

use App\Http\Controllers\Api\V1\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\Vocabulary\VocabularyController;
use App\Http\Controllers\Api\V1\Auth\UserAuthController;
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
