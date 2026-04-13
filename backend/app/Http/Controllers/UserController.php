<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * ログインユーザーのプロフィールを返す
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * ニックネームを更新する
     */
    public function updateNickname(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nickname' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $user->update(['nickname' => $validated['nickname']]);

        return response()->json($user);
    }
}
