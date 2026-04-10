<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vocabularies', function (Blueprint $table): void {
            $table->ulid('id')->primary();

            $table->string('term', 255);
            $table->string('meaning_ja', 255);
            $table->string('pos', 50);
            $table->unsignedTinyInteger('level');

            $table->text('example_sentence')->nullable();
            $table->text('example_translation_ja')->nullable();
            $table->string('audio_url', 2048)->nullable();
            $table->string('status', 20)->default('published');

            $table->timestamps();

            $table->unique(['term', 'pos', 'meaning_ja']);
            $table->index(['level', 'pos']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabularies');
    }
};
