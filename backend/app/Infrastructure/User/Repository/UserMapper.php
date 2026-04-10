<?php

declare(strict_types=1);

namespace App\Infrastructure\User\Repository;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\HashedPassword;
use App\Domain\User\Entity\User as DomainUser;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserName;
use App\Models\User as EloquentUser;
use DateTimeImmutable;

final class UserMapper
{
    public static function toDomain(EloquentUser $model): DomainUser
    {
        return DomainUser::reconstruct(
            id: new UserId((string) $model->id),
            name: new UserName((string) $model->name),
            email: new Email((string) $model->email),
            password: new HashedPassword((string) $model->password),
            createdAt: new DateTimeImmutable($model->created_at?->toISOString() ?? 'now'),
        );
    }
}

