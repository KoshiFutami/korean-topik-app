<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\DeleteVocabulary;

final class DeleteVocabularyInput
{
    public function __construct(public readonly string $id) {}
}
