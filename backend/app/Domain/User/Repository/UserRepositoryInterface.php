<?php

declare(strict_types=1);

namespace App\Domain\User\Repository;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\User\Entity\User;
use App\Domain\User\ValueObject\UserId;

interface UserRepositoryInterface
{
    public function findById(UserId $id): ?User;

    public function findByEmail(Email $email): ?User;

    public function save(User $user): void;

    public function existsByEmail(Email $email): bool;
}
