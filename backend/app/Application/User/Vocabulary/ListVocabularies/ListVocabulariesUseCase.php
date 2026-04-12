<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;

final class ListVocabulariesUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(ListVocabulariesInput $input): ListVocabulariesOutput
    {
        $level = $input->level !== null ? TopikLevel::from($input->level) : null;
        $entryType = $input->entryType !== null ? EntryType::from($input->entryType) : null;
        $pos = $input->pos !== null ? PartOfSpeech::from($input->pos) : null;
        $q = $input->q !== null && $input->q !== '' ? $input->q : null;

        if ($input->compactList) {
            $rows = $this->vocabularies->listCardsByStatus(
                VocabularyStatus::PUBLISHED,
                level: $level,
                entryType: $entryType,
                pos: $pos,
                q: $q,
            );

            return new ListVocabulariesOutput(
                vocabularies: array_map(
                    static fn ($r) => ListVocabulariesCard::fromReadModel($r),
                    $rows,
                ),
            );
        }

        $items = $this->vocabularies->listByStatus(
            VocabularyStatus::PUBLISHED,
            level: $level,
            entryType: $entryType,
            pos: $pos,
            q: $q,
        );

        return new ListVocabulariesOutput(
            vocabularies: array_map(static fn ($v) => ListVocabulariesVocabulary::fromDomain($v), $items),
        );
    }
}
