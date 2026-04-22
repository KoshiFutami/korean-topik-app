<?php

declare(strict_types=1);

namespace App\Application\User\Auth\UploadProfileImage;

use App\Domain\User\Entity\User;
use App\Domain\User\Exception\UserNotFoundException;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\ProfileImagePath;
use App\Domain\User\ValueObject\UserId;
use App\Services\User\ProfileImageService;
use App\Support\ProfileImageUrl;

final class UploadProfileImageUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly ProfileImageService $profileImageService,
    ) {}

    public function execute(UploadProfileImageInput $input): UploadProfileImageOutput
    {
        $user = $this->users->findById(new UserId($input->userId));

        if ($user === null) {
            throw new UserNotFoundException;
        }

        $oldPath = $user->profileImagePath()?->value();

        $newPath = $this->profileImageService->upload(
            userId: $input->userId,
            file: $input->file,
            oldPath: $oldPath,
        );

        $updated = User::reconstruct(
            id: $user->id(),
            name: $user->name(),
            nickname: $user->nickname(),
            email: $user->email(),
            password: $user->password(),
            createdAt: $user->createdAt(),
            profileImagePath: new ProfileImagePath($newPath),
            profileImageOffsetX: null,
            profileImageOffsetY: null,
        );

        $this->users->save($updated);

        $url = ProfileImageUrl::resolve($newPath);

        return new UploadProfileImageOutput(
            profileImageUrl: $url ?? '',
            profileImageOffsetX: null,
            profileImageOffsetY: null,
        );
    }
}
