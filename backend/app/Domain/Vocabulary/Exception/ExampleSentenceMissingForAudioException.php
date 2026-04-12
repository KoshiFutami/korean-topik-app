<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Exception;

use RuntimeException;

final class ExampleSentenceMissingForAudioException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('例文が登録されていないため、例文の音声を生成できません。');
    }
}
