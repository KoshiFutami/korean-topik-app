<?php

declare(strict_types=1);

namespace App\Infrastructure\Admin\Repository;

use App\Domain\Admin\Entity\Admin as DomainAdmin;
use App\Domain\Admin\ValueObject\AdminId;
use App\Domain\Admin\ValueObject\AdminName;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\HashedPassword;
use App\Models\Admin as EloquentAdmin;
use DateTimeImmutable;

final class AdminMapper
{
    public static function toDomain(EloquentAdmin $model): DomainAdmin
    {
        return DomainAdmin::reconstruct(
            id: new AdminId((string) $model->id),
            name: new AdminName((string) $model->name),
            email: new Email((string) $model->email),
            password: new HashedPassword((string) $model->password),
            createdAt: new DateTimeImmutable($model->created_at?->toISOString() ?? 'now'),
        );
    }
}
