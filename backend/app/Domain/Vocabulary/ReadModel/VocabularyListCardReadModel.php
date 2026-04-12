<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ReadModel;

/**
 * 一覧カード表示用の最小列（例文・例文音声は含めない）。
 */
final readonly class VocabularyListCardReadModel
{
    public function __construct(
        public string $id,
        public string $term,
        public string $meaningJa,
        public string $pos,
        public int $level,
        public string $entryType,
        public ?string $audioUrl,
    ) {}
}
