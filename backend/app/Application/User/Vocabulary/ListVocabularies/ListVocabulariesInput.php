<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

final class ListVocabulariesInput
{
    public function __construct(
        public readonly ?int $level = null,
        public readonly ?string $entryType = null,
        public readonly ?string $pos = null,
    ) {}
}
