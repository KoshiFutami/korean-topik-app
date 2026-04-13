<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookmarks', function (Blueprint $table): void {
            $table->ulid('id')->primary();

            $table->ulid('user_id');
            $table->ulid('vocabulary_id');

            $table->timestamps();

            $table->unique(['user_id', 'vocabulary_id']);

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('vocabulary_id')->references('id')->on('vocabularies')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
    }
};
