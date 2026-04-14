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
        Schema::create('topik_questions', function (Blueprint $table): void {
            $table->ulid('id')->primary();

            $table->unsignedTinyInteger('level');
            $table->string('question_type', 50)->default('grammar');
            $table->text('question_text');
            $table->text('explanation_ja')->nullable();
            $table->string('status', 20)->default('published');

            $table->timestamps();

            $table->index(['level', 'question_type', 'status']);
        });

        Schema::create('topik_question_options', function (Blueprint $table): void {
            $table->ulid('id')->primary();

            $table->ulid('question_id');
            $table->unsignedTinyInteger('option_number');
            $table->string('text', 255);
            $table->boolean('is_correct')->default(false);

            $table->timestamps();

            $table->foreign('question_id')
                ->references('id')
                ->on('topik_questions')
                ->cascadeOnDelete();

            $table->unique(['question_id', 'option_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('topik_question_options');
        Schema::dropIfExists('topik_questions');
    }
};
