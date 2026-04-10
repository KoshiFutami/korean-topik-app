<?php

namespace App\Http\Controllers\Api\V1\Admin\Auth;

use App\Application\Admin\Auth\GetMyProfile\GetMyProfileInput;
use App\Application\Admin\Auth\GetMyProfile\GetMyProfileUseCase;
use App\Application\Admin\Auth\LoginAdmin\LoginAdminInput;
use App\Application\Admin\Auth\LoginAdmin\LoginAdminUseCase;
use App\Application\Admin\Auth\LogoutAdmin\LogoutAdminInput;
use App\Application\Admin\Auth\LogoutAdmin\LogoutAdminUseCase;
use App\Domain\Admin\Exception\AdminNotFoundException;
use App\Domain\Admin\Exception\InvalidCredentialsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuthController extends Controller
{
    public function __construct(
        private readonly LoginAdminUseCase $loginAdmin,
        private readonly LogoutAdminUseCase $logoutAdmin,
        private readonly GetMyProfileUseCase $getMyProfile,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $output = $this->loginAdmin->execute(new LoginAdminInput(
                email: (string) $request->input('email'),
                password: (string) $request->input('password'),
            ));

            return response()->json([
                'token' => $output->token,
                'admin' => [
                    'id' => $output->adminId,
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
        $admin = $request->user('admin');

        $this->logoutAdmin->execute(new LogoutAdminInput(adminId: (string) $admin?->getAuthIdentifier()));

        $token = $admin?->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        } elseif ($admin) {
            $admin->tokens()->delete();
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

            $admin = $request->user('admin');
            $output = $this->getMyProfile->execute(new GetMyProfileInput(
                adminId: (string) $admin?->getAuthIdentifier(),
            ));

            return response()->json([
                'admin' => [
                    'id' => $output->adminId,
                    'name' => $output->name,
                    'email' => $output->email,
                    'created_at' => $output->createdAt->format(DATE_ATOM),
                ],
            ]);
        } catch (AdminNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}

