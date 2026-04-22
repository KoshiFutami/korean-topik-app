<?php

declare(strict_types=1);

namespace App\Infrastructure\User\Repository;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\User\Entity\User as DomainUser;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Models\User as EloquentUser;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(UserId $id): ?DomainUser
    {
        $model = EloquentUser::query()->find($id->value());

        return $model ? UserMapper::toDomain($model) : null;
    }

    public function findByEmail(Email $email): ?DomainUser
    {
        $model = EloquentUser::query()
            ->where('email', $email->value())
            ->first();

        return $model ? UserMapper::toDomain($model) : null;
    }

    public function save(DomainUser $user): void
    {
        EloquentUser::query()->updateOrCreate(
            ['id' => $user->id()->value()],
            [
                'name' => $user->name()->value(),
                'nickname' => $user->nickname()?->value(),
                'profile_image_path' => $user->profileImagePath()?->value(),
                'email' => $user->email()->value(),
                'password' => $user->password()->value(),
            ],
        );
    }

    public function existsByEmail(Email $email): bool
    {
        return EloquentUser::query()
            ->where('email', $email->value())
            ->exists();
    }
}
