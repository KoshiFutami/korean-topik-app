<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\Entity;

use App\Domain\Vocabulary\ValueObject\EntryType;
use App\Domain\Vocabulary\ValueObject\MeaningJa;
use App\Domain\Vocabulary\ValueObject\PartOfSpeech;
use App\Domain\Vocabulary\ValueObject\Term;
use App\Domain\Vocabulary\ValueObject\TopikLevel;
use App\Domain\Vocabulary\ValueObject\VocabularyId;
use App\Domain\Vocabulary\ValueObject\VocabularyStatus;
use DateTimeImmutable;

final class Vocabulary
{
    private function __construct(
        private readonly VocabularyId $id,
        private Term $term,
        private MeaningJa $meaningJa,
        private PartOfSpeech $pos,
        private TopikLevel $level,
        private EntryType $entryType,
        private ?string $exampleSentence,
        private ?string $exampleTranslationJa,
        private ?string $audioUrl,
        private VocabularyStatus $status,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function create(
        Term $term,
        MeaningJa $meaningJa,
        PartOfSpeech $pos,
        TopikLevel $level,
        ?EntryType $entryType,
        ?string $exampleSentence,
        ?string $exampleTranslationJa,
        ?string $audioUrl,
        ?VocabularyStatus $status = null,
    ): self {
        return new self(
            id: VocabularyId::generate(),
            term: $term,
            meaningJa: $meaningJa,
            pos: $pos,
            level: $level,
            entryType: $entryType ?? EntryType::WORD,
            exampleSentence: $exampleSentence,
            exampleTranslationJa: $exampleTranslationJa,
            audioUrl: $audioUrl,
            status: $status ?? VocabularyStatus::PUBLISHED,
            createdAt: new DateTimeImmutable,
        );
    }

    public static function reconstruct(
        VocabularyId $id,
        Term $term,
        MeaningJa $meaningJa,
        PartOfSpeech $pos,
        TopikLevel $level,
        EntryType $entryType,
        ?string $exampleSentence,
        ?string $exampleTranslationJa,
        ?string $audioUrl,
        VocabularyStatus $status,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            term: $term,
            meaningJa: $meaningJa,
            pos: $pos,
            level: $level,
            entryType: $entryType,
            exampleSentence: $exampleSentence,
            exampleTranslationJa: $exampleTranslationJa,
            audioUrl: $audioUrl,
            status: $status,
            createdAt: $createdAt,
        );
    }

    public function id(): VocabularyId
    {
        return $this->id;
    }

    public function term(): Term
    {
        return $this->term;
    }

    public function meaningJa(): MeaningJa
    {
        return $this->meaningJa;
    }

    public function pos(): PartOfSpeech
    {
        return $this->pos;
    }

    public function level(): TopikLevel
    {
        return $this->level;
    }

    public function entryType(): EntryType
    {
        return $this->entryType;
    }

    public function exampleSentence(): ?string
    {
        return $this->exampleSentence;
    }

    public function exampleTranslationJa(): ?string
    {
        return $this->exampleTranslationJa;
    }

    public function audioUrl(): ?string
    {
        return $this->audioUrl;
    }

    public function status(): VocabularyStatus
    {
        return $this->status;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function update(
        Term $term,
        MeaningJa $meaningJa,
        PartOfSpeech $pos,
        TopikLevel $level,
        EntryType $entryType,
        ?string $exampleSentence,
        ?string $exampleTranslationJa,
        ?string $audioUrl,
        VocabularyStatus $status,
    ): void {
        $this->term = $term;
        $this->meaningJa = $meaningJa;
        $this->pos = $pos;
        $this->level = $level;
        $this->entryType = $entryType;
        $this->exampleSentence = $exampleSentence;
        $this->exampleTranslationJa = $exampleTranslationJa;
        $this->audioUrl = $audioUrl;
        $this->status = $status;
    }
}
