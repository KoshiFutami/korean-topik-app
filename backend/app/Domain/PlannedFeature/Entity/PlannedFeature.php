<?php

declare(strict_types=1);

namespace App\Domain\PlannedFeature\Entity;

use App\Domain\PlannedFeature\ValueObject\PlannedFeatureId;
use DateTimeImmutable;

/**
 * 公開予定機能（ロードマップ）のドメインエンティティ。
 * ユーザー向け一覧は is_published かつ sort_order 順で提供する。
 */
final class PlannedFeature
{
    private function __construct(
        private readonly PlannedFeatureId $id,
        private readonly string $titleJa,
        private readonly ?string $summaryJa,
        private readonly ?string $subtitleKo,
        private readonly int $sortOrder,
        private readonly bool $isPublished,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function reconstruct(
        PlannedFeatureId $id,
        string $titleJa,
        ?string $summaryJa,
        ?string $subtitleKo,
        int $sortOrder,
        bool $isPublished,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            titleJa: $titleJa,
            summaryJa: $summaryJa,
            subtitleKo: $subtitleKo,
            sortOrder: $sortOrder,
            isPublished: $isPublished,
            createdAt: $createdAt,
        );
    }

    public function id(): PlannedFeatureId
    {
        return $this->id;
    }

    public function titleJa(): string
    {
        return $this->titleJa;
    }

    public function summaryJa(): ?string
    {
        return $this->summaryJa;
    }

    public function subtitleKo(): ?string
    {
        return $this->subtitleKo;
    }

    public function sortOrder(): int
    {
        return $this->sortOrder;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
