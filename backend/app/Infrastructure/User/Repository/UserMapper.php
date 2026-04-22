<?php

declare(strict_types=1);

namespace App\Infrastructure\User\Repository;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\HashedPassword;
use App\Domain\User\Entity\User as DomainUser;
use App\Domain\User\ValueObject\ProfileImagePath;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserName;
use App\Domain\User\ValueObject\UserNickname;
use App\Models\User as EloquentUser;
use DateTimeImmutable;

final class UserMapper
{
    public static function toDomain(EloquentUser $model): DomainUser
    {
        $nickname = $model->nickname !== null ? new UserNickname((string) $model->nickname) : null;
        $profileImagePath = $model->profile_image_path !== null
            ? new ProfileImagePath((string) $model->profile_image_path)
            : null;

        return DomainUser::reconstruct(
            id: new UserId((string) $model->id),
            name: new UserName((string) $model->name),
            nickname: $nickname,
            email: new Email((string) $model->email),
            password: new HashedPassword((string) $model->password),
            createdAt: new DateTimeImmutable($model->created_at?->toISOString() ?? 'now'),
            profileImagePath: $profileImagePath,
            profileImageOffsetX: $model->profile_image_offset_x !== null ? (float) $model->profile_image_offset_x : null,
            profileImageOffsetY: $model->profile_image_offset_y !== null ? (float) $model->profile_image_offset_y : null,
        );
    }
}
