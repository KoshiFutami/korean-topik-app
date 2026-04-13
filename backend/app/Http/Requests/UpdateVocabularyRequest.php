<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVocabularyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'korean' => ['sometimes', 'required', 'string', 'max:255'],
            'japanese' => ['sometimes', 'required', 'string', 'max:255'],
            'level' => ['sometimes', 'required', 'integer', 'min:1', 'max:6'],
            'example_sentence' => ['nullable', 'string'],
        ];
    }
}
