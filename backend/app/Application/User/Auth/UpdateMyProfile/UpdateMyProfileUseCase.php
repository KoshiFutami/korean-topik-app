<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UpdateMyProfile;

use App\Application\Shared\Port\PasswordHasherInterface;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\User\Entity\User;
use App\Domain\User\Exception\InvalidCredentialsException;
use App\Domain\User\Exception\UserAlreadyExistsException;
use App\Domain\User\Exception\UserNotFoundException;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserName;
use App\Domain\User\ValueObject\UserNickname;
use App\Support\ProfileImageUrl;

final class UpdateMyProfileUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly PasswordHasherInterface $hasher,
    ) {}

    public function execute(UpdateMyProfileInput $input): UpdateMyProfileOutput
    {
        $user = $this->users->findById(new UserId($input->userId));

        if ($user === null) {
            throw new UserNotFoundException;
        }

        $newEmail = new Email($input->email);

        if (! $user->email()->equals($newEmail) && $this->users->existsByEmail($newEmail)) {
            throw new UserAlreadyExistsException;
        }

        $hashedPassword = $user->password();

        if ($input->newPassword !== null) {
            if ($input->currentPassword === null || ! $this->hasher->verify($input->currentPassword, $user->password())) {
                throw new InvalidCredentialsException;
            }

            $hashedPassword = $this->hasher->hash($input->newPassword);
        }

        $updated = User::reconstruct(
            id: $user->id(),
            name: new UserName($input->name),
            nickname: $input->nickname !== null ? new UserNickname($input->nickname) : null,
            email: $newEmail,
            password: $hashedPassword,
            createdAt: $user->createdAt(),
            profileImagePath: $user->profileImagePath(),
            profileImageOffsetX: $user->profileImageOffsetX(),
            profileImageOffsetY: $user->profileImageOffsetY(),
        );

        $this->users->save($updated);

        return new UpdateMyProfileOutput(
            userId: $updated->id()->value(),
            name: $updated->name()->value(),
            nickname: $updated->nickname()?->value(),
            email: $updated->email()->value(),
            createdAt: $updated->createdAt(),
            profileImageUrl: ProfileImageUrl::resolve($updated->profileImagePath()?->value()),
            profileImageOffsetX: $updated->profileImageOffsetX(),
            profileImageOffsetY: $updated->profileImageOffsetY(),
        );
    }
}
