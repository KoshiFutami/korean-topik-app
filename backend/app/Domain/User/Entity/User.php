<?php

declare(strict_types=1);

namespace App\Domain\User\Entity;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\HashedPassword;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserName;
use App\Domain\User\ValueObject\UserNickname;
use DateTimeImmutable;

final class User
{
    private function __construct(
        private readonly UserId $id,
        private readonly UserName $name,
        private readonly ?UserNickname $nickname,
        private readonly Email $email,
        private readonly HashedPassword $password,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function create(
        UserName $name,
        Email $email,
        HashedPassword $password,
    ): self {
        return new self(
            id: UserId::generate(),
            name: $name,
            nickname: null,
            email: $email,
            password: $password,
            createdAt: new DateTimeImmutable,
        );
    }

    public static function reconstruct(
        UserId $id,
        UserName $name,
        Email $email,
        HashedPassword $password,
        DateTimeImmutable $createdAt,
        ?UserNickname $nickname = null,
    ): self {
        return new self(
            id: $id,
            name: $name,
            nickname: $nickname,
            email: $email,
            password: $password,
            createdAt: $createdAt,
        );
    }

    public function id(): UserId
    {
        return $this->id;
    }

    public function name(): UserName
    {
        return $this->name;
    }

    public function nickname(): ?UserNickname
    {
        return $this->nickname;
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
