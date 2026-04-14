<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\BulkUpsertVocabularies;

final class BulkUpsertVocabulariesInput
{
    /**
     * @param  array<int, array{term: string, meaning_ja: string, pos: string, level: int, entry_type: string, example_sentence: string|null, example_translation_ja: string|null, status: string}>  $rows
     */
    public function __construct(
        public readonly array $rows,
    ) {}
}
