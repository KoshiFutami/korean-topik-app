<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Application\User\Auth\GetMyProfile\GetMyProfileInput;
use App\Application\User\Auth\GetMyProfile\GetMyProfileUseCase;
use App\Application\User\Auth\LoginUser\LoginUserInput;
use App\Application\User\Auth\LoginUser\LoginUserUseCase;
use App\Application\User\Auth\LogoutUser\LogoutUserInput;
use App\Application\User\Auth\LogoutUser\LogoutUserUseCase;
use App\Application\User\Auth\RegisterUser\RegisterUserInput;
use App\Application\User\Auth\RegisterUser\RegisterUserUseCase;
use App\Domain\User\Exception\InvalidCredentialsException;
use App\Domain\User\Exception\UserAlreadyExistsException;
use App\Domain\User\Exception\UserNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class UserAuthController extends Controller
{
    public function __construct(
        private readonly RegisterUserUseCase $registerUser,
        private readonly LoginUserUseCase $loginUser,
        private readonly LogoutUserUseCase $logoutUser,
        private readonly GetMyProfileUseCase $getMyProfile,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $output = $this->registerUser->execute(new RegisterUserInput(
                name: (string) $request->input('name'),
                email: (string) $request->input('email'),
                password: (string) $request->input('password'),
            ));

            return response()->json([
                'token' => $output->token,
                'user' => [
                    'id' => $output->userId,
                    'name' => $output->name,
                    'email' => $output->email,
                    'created_at' => $output->createdAt->format(DATE_ATOM),
                ],
            ], 201);
        } catch (UserAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $output = $this->loginUser->execute(new LoginUserInput(
                email: (string) $request->input('email'),
                password: (string) $request->input('password'),
            ));

            return response()->json([
                'token' => $output->token,
                'user' => [
                    'id' => $output->userId,
                    'name' => $output->name,
                    'email' => $output->email,
                ],
            ]);
        } catch (InvalidCredentialsException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->logoutUser->execute(new LogoutUserInput(userId: (string) $user?->getAuthIdentifier()));

        $token = $user?->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        } elseif ($user) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        try {
            $plainTextToken = $request->bearerToken();
            if ($plainTextToken) {
                $token = PersonalAccessToken::findToken($plainTextToken);
                if ($token === null) {
                    return response()->json(['message' => 'Unauthenticated.'], 401);
                }
            }

            $user = $request->user();
            $output = $this->getMyProfile->execute(new GetMyProfileInput(
                userId: (string) $user?->getAuthIdentifier(),
            ));

            return response()->json([
                'user' => [
                    'id' => $output->userId,
                    'name' => $output->name,
                    'email' => $output->email,
                    'created_at' => $output->createdAt->format(DATE_ATOM),
                ],
            ]);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}

