<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\BulkUpsertVocabularies;

final class BulkUpsertVocabulariesOutput
{
    public function __construct(
        public readonly int $created,
        public readonly int $updated,
    ) {}
}
