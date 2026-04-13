<?php

declare(strict_types=1);

namespace App\Application\User\Auth\RegisterUser;

use App\Application\Shared\Port\PasswordHasherInterface;
use App\Application\Shared\Port\TokenServiceInterface;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\User\Entity\User;
use App\Domain\User\Exception\UserAlreadyExistsException;
use App\Domain\User\Repository\UserRepositoryInterface;
use App\Domain\User\ValueObject\UserName;

final class RegisterUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly PasswordHasherInterface $hasher,
        private readonly TokenServiceInterface $tokens,
    ) {}

    public function execute(RegisterUserInput $input): RegisterUserOutput
    {
        $email = new Email($input->email);

        if ($this->users->existsByEmail($email)) {
            throw new UserAlreadyExistsException;
        }

        $user = User::create(
            name: new UserName($input->name),
            email: $email,
            password: $this->hasher->hash($input->password),
        );

        $this->users->save($user);

        $token = $this->tokens->createToken($user->id()->value(), 'user');

        return new RegisterUserOutput(
            userId: $user->id()->value(),
            name: $user->name()->value(),
            nickname: $user->nickname()?->value(),
            email: $user->email()->value(),
            token: $token,
            createdAt: $user->createdAt(),
        );
    }
}
