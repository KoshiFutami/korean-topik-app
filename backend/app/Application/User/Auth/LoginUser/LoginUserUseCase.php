<?php

declare(strict_types=1);

namespace App\Application\User\Auth\LoginUser;

use App\Application\Shared\Port\PasswordHasherInterface;
use App\Application\Shared\Port\TokenServiceInterface;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\User\Exception\InvalidCredentialsException;
use App\Domain\User\Repository\UserRepositoryInterface;

final class LoginUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly PasswordHasherInterface $hasher,
        private readonly TokenServiceInterface $tokens,
    ) {}

    public function execute(LoginUserInput $input): LoginUserOutput
    {
        $user = $this->users->findByEmail(new Email($input->email));

        if ($user === null) {
            throw new InvalidCredentialsException;
        }

        if (! $this->hasher->verify($input->password, $user->password())) {
            throw new InvalidCredentialsException;
        }

        $token = $this->tokens->createToken($user->id()->value(), 'user');

        return new LoginUserOutput(
            userId: $user->id()->value(),
            name: $user->name()->value(),
            nickname: $user->nickname()?->value(),
            email: $user->email()->value(),
            token: $token,
        );
    }
}
