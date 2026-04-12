<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

use App\Domain\Vocabulary\ReadModel\VocabularyListCardReadModel;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\TopikLevel;

/**
 * 一覧カード用（例文・例文音声 URL を含めない）。
 */
final class ListVocabulariesCard
{
    public function __construct(
        public readonly string $id,
        public readonly string $term,
        public readonly string $meaningJa,
        public readonly string $pos,
        public readonly string $posLabelJa,
        public readonly int $level,
        public readonly string $levelLabelJa,
        public readonly string $entryType,
        public readonly string $entryTypeLabelJa,
        public readonly ?string $audioUrl,
    ) {}

    public static function fromReadModel(VocabularyListCardReadModel $row): self
    {
        $pos = PartOfSpeech::from($row->pos);
        $level = TopikLevel::from($row->level);
        $entryType = EntryType::from($row->entryType);

        return new self(
            id: $row->id,
            term: $row->term,
            meaningJa: $row->meaningJa,
            pos: $row->pos,
            posLabelJa: $pos->labelJa(),
            level: $row->level,
            levelLabelJa: $level->labelJa(),
            entryType: $row->entryType,
            entryTypeLabelJa: $entryType->labelJa(),
            audioUrl: $row->audioUrl,
        );
    }
}
