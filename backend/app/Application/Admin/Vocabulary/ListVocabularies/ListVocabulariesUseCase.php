<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\ListVocabularies;

use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;

final class ListVocabulariesUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(): ListVocabulariesOutput
    {
        $items = $this->vocabularies->list();

        return new ListVocabulariesOutput(
            vocabularies: array_map(static fn ($v) => ListVocabulariesVocabulary::fromDomain($v), $items),
        );
    }
}

