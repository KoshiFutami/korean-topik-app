<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileImagePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'offset_x' => ['required', 'numeric', 'min:0', 'max:100'],
            'offset_y' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'offset_x' => '水平位置',
            'offset_y' => '垂直位置',
        ];
    }

    public function messages(): array
    {
        return [
            'offset_x.required' => '水平位置は必須です。',
            'offset_x.numeric' => '水平位置は数値で指定してください。',
            'offset_x.min' => '水平位置は0以上で指定してください。',
            'offset_x.max' => '水平位置は100以下で指定してください。',
            'offset_y.required' => '垂直位置は必須です。',
            'offset_y.numeric' => '垂直位置は数値で指定してください。',
            'offset_y.min' => '垂直位置は0以上で指定してください。',
            'offset_y.max' => '垂直位置は100以下で指定してください。',
        ];
    }
}
