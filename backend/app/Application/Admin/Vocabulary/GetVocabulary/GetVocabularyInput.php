<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\GetVocabulary;

final class GetVocabularyInput
{
    public function __construct(public readonly string $id) {}
}
