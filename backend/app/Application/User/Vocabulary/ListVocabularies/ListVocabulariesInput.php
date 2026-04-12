<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

final class ListVocabulariesInput
{
    public function __construct(
        public readonly ?int $level = null,
        public readonly ?string $entryType = null,
        public readonly ?string $pos = null,
        /** 一覧カード向けの軽量レスポンス（例文・例文音声を省き、DB も必要列のみ読む） */
        public readonly bool $compactList = false,
    ) {}
}
