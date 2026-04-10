<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\GetMyProfile;

use App\Domain\Admin\Exception\AdminNotFoundException;
use App\Domain\Admin\Repository\AdminRepositoryInterface;
use App\Domain\Admin\ValueObject\AdminId;

final class GetMyProfileUseCase
{
    public function __construct(private readonly AdminRepositoryInterface $admins) {}

    public function execute(GetMyProfileInput $input): GetMyProfileOutput
    {
        $admin = $this->admins->findById(new AdminId($input->adminId));

        if ($admin === null) {
            throw new AdminNotFoundException();
        }

        return new GetMyProfileOutput(
            adminId: $admin->id()->value(),
            name: $admin->name()->value(),
            email: $admin->email()->value(),
            createdAt: $admin->createdAt(),
        );
    }
}

