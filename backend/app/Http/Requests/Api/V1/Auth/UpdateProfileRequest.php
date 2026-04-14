<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:100'],
            'nickname' => ['nullable', 'string', 'min:1', 'max:10'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'current_password' => ['nullable', 'string'],
            'new_password' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => '名前',
            'nickname' => 'ニックネーム',
            'email' => 'メールアドレス',
            'current_password' => '現在のパスワード',
            'new_password' => '新しいパスワード',
            'new_password_confirmation' => '新しいパスワード（確認）',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です。',
            'name.min' => '名前は1文字以上で入力してください。',
            'name.max' => '名前は100文字以内で入力してください。',
            'nickname.min' => 'ニックネームは1文字以上で入力してください。',
            'nickname.max' => 'ニックネームは10文字以内で入力してください。',
            'email.required' => 'メールアドレスは必須です。',
            'email.email' => '有効なメールアドレスを入力してください。',
            'email.max' => 'メールアドレスは255文字以内で入力してください。',
            'new_password.min' => '新しいパスワードは8文字以上で入力してください。',
            'new_password.max' => '新しいパスワードは255文字以内で入力してください。',
            'new_password.confirmed' => '新しいパスワードと確認用パスワードが一致しません。',
        ];
    }
}
