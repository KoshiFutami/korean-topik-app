<?php

declare(strict_types=1);

namespace App\Infrastructure\Admin\Repository;

use App\Domain\Admin\Entity\Admin as DomainAdmin;
use App\Domain\Admin\Repository\AdminRepositoryInterface;
use App\Domain\Admin\ValueObject\AdminId;
use App\Domain\Shared\ValueObject\Email;
use App\Models\Admin as EloquentAdmin;

final class EloquentAdminRepository implements AdminRepositoryInterface
{
    public function findById(AdminId $id): ?DomainAdmin
    {
        $model = EloquentAdmin::query()->find($id->value());

        return $model ? AdminMapper::toDomain($model) : null;
    }

    public function findByEmail(Email $email): ?DomainAdmin
    {
        $model = EloquentAdmin::query()
            ->where('email', $email->value())
            ->first();

        return $model ? AdminMapper::toDomain($model) : null;
    }

    public function existsByEmail(Email $email): bool
    {
        return EloquentAdmin::query()
            ->where('email', $email->value())
            ->exists();
    }
}

