<?php

declare(strict_types=1);

namespace App\Application\User\Auth\GetMyProfile;

use App\Domain\User\Exception\UserNotFoundException;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\UserId;

final class GetMyProfileUseCase
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    public function execute(GetMyProfileInput $input): GetMyProfileOutput
    {
        $user = $this->users->findById(new UserId($input->userId));

        if ($user === null) {
            throw new UserNotFoundException;
        }

        return new GetMyProfileOutput(
            userId: $user->id()->value(),
            name: $user->name()->value(),
            nickname: $user->nickname()?->value(),
            email: $user->email()->value(),
            createdAt: $user->createdAt(),
        );
    }
}
