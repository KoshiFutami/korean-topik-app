<?php

declare(strict_types=1);

namespace App\Domain\Admin\Entity;

use App\Domain\Admin\ValueObject\AdminId;
use App\Domain\Admin\ValueObject\AdminName;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\HashedPassword;
use DateTimeImmutable;

final class Admin
{
    private function __construct(
        private readonly AdminId $id,
        private readonly AdminName $name,
        private readonly Email $email,
        private readonly HashedPassword $password,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function reconstruct(
        AdminId $id,
        AdminName $name,
        Email $email,
        HashedPassword $password,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            name: $name,
            email: $email,
            password: $password,
            createdAt: $createdAt,
        );
    }

    public function id(): AdminId
    {
        return $this->id;
    }

    public function name(): AdminName
    {
        return $this->name;
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function password(): HashedPassword
    {
        return $this->password;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function equals(self $other): bool
    {
        return $this->id->equals($other->id);
    }
}

