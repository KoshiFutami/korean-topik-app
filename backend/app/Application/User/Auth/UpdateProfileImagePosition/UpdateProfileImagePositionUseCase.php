<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateProfileImagePosition;

use App\Domain\User\Entity\User;
use App\Domain\User\Exception\UserNotFoundException;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\UserId;

final class UpdateProfileImagePositionUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {}

    public function execute(UpdateProfileImagePositionInput $input): UpdateProfileImagePositionOutput
    {
        $user = $this->users->findById(new UserId($input->userId));

        if ($user === null) {
            throw new UserNotFoundException;
        }

        $updated = User::reconstruct(
            id: $user->id(),
            name: $user->name(),
            nickname: $user->nickname(),
            email: $user->email(),
            password: $user->password(),
            createdAt: $user->createdAt(),
            profileImagePath: $user->profileImagePath(),
            profileImageOffsetX: $input->offsetX,
            profileImageOffsetY: $input->offsetY,
        );

        $this->users->save($updated);

        return new UpdateProfileImagePositionOutput(
            profileImageOffsetX: $input->offsetX,
            profileImageOffsetY: $input->offsetY,
        );
    }
}
