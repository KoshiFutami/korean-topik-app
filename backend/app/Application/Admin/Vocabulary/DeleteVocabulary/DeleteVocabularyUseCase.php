<?php

declare(strict_types=1);

namespace App\Application\Admin\Vocabulary\DeleteVocabulary;

use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Domain\Vocabulary\Repository\VocabularyRepositoryInterface;
use App\Domain\Vocabulary\ValueObject\VocabularyId;

final class DeleteVocabularyUseCase
{
    public function __construct(private readonly VocabularyRepositoryInterface $vocabularies) {}

    public function execute(DeleteVocabularyInput $input): void
    {
        $id = new VocabularyId($input->id);
        $vocabulary = $this->vocabularies->findById($id);
        if ($vocabulary === null) {
            throw new VocabularyNotFoundException();
        }

        $this->vocabularies->delete($id);
    }
}

