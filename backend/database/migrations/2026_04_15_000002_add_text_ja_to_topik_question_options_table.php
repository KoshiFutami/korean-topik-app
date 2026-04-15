<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('topik_question_options', function (Blueprint $table): void {
            $table->string('text_ja', 255)->nullable()->after('text');
        });
    }

    public function down(): void
    {
        Schema::table('topik_question_options', function (Blueprint $table): void {
            $table->dropColumn('text_ja');
        });
    }
};
