<?php

declare(strict_types=1);

namespace App\Application\User\Vocabulary\ListVocabularies;

final class ListVocabulariesOutput
{
    /**
     * @param  array<int, ListVocabulariesVocabulary>  $vocabularies
     */
    public function __construct(public readonly array $vocabularies) {}
}
