<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVocabularyRequest extends FormRequest
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
            'korean' => ['required', 'string', 'max:255'],
            'japanese' => ['required', 'string', 'max:255'],
            'level' => ['required', 'integer', 'min:1', 'max:6'],
            'example_sentence' => ['nullable', 'string'],
        ];
    }
}
