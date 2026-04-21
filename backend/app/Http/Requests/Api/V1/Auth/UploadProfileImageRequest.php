<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfileImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'image' => 'プロフィール画像',
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'プロフィール画像は必須です。',
            'image.file' => 'プロフィール画像はファイルで指定してください。',
            'image.image' => '画像ファイルを指定してください。',
            'image.mimes' => 'プロフィール画像は JPEG, PNG, GIF, WebP 形式のみ使用できます。',
            'image.max' => 'プロフィール画像は 5MB 以下にしてください。',
        ];
    }
}
