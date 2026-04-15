<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('topik_questions', function (Blueprint $table): void {
            $table->text('question_text_ja')->nullable()->after('question_text');
        });
    }

    public function down(): void
    {
        Schema::table('topik_questions', function (Blueprint $table): void {
            $table->dropColumn('question_text_ja');
        });
    }
};
