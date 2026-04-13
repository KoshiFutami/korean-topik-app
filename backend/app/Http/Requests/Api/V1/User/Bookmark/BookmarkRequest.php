<?php

namespace App\Http\Requests\Api\V1\User\Bookmark;

use Illuminate\Foundation\Http\FormRequest;

class BookmarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vocabulary_id' => ['required', 'string'],
        ];
    }
}
