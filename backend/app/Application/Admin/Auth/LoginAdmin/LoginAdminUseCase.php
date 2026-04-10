<?php

declare(strict_types=1);

namespace App\Application\Admin\Auth\LoginAdmin;

use App\Application\Shared\Port\PasswordHasherInterface;
use App\Application\Shared\Port\TokenServiceInterface;
use App\Domain\Admin\Exception\InvalidCredentialsException;
use App\Domain\Admin\Repository\AdminRepositoryInterface;
use App\Domain\Shared\ValueObject\Email;

final class LoginAdminUseCase
{
    public function __construct(
        private readonly AdminRepositoryInterface $admins,
        private readonly PasswordHasherInterface $hasher,
        private readonly TokenServiceInterface $tokens,
    ) {}

    public function execute(LoginAdminInput $input): LoginAdminOutput
    {
        $admin = $this->admins->findByEmail(new Email($input->email));

        if ($admin === null) {
            throw new InvalidCredentialsException();
        }

        if (! $this->hasher->verify($input->password, $admin->password())) {
            throw new InvalidCredentialsException();
        }

        $token = $this->tokens->createToken($admin->id()->value(), 'admin');

        return new LoginAdminOutput(
            adminId: $admin->id()->value(),
            name: $admin->name()->value(),
            email: $admin->email()->value(),
            token: $token,
        );
    }
}

