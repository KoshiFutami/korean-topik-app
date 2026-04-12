<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planned_features', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('title_ja');
            $table->text('summary_ja')->nullable();
            $table->string('subtitle_ko')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planned_features');
    }
};
