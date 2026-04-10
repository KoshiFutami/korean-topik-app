<?php

declare(strict_types=1);

namespace App\Domain\Admin\Repository;

use App\Domain\Admin\Entity\Admin;
use App\Domain\Admin\ValueObject\AdminId;
use App\Domain\Shared\ValueObject\Email;

interface AdminRepositoryInterface
{
    public function findById(AdminId $id): ?Admin;

    public function findByEmail(Email $email): ?Admin;

    public function existsByEmail(Email $email): bool;
}
