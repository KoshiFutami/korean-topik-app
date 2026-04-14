<?php

namespace App\Http\Requests\Api\V1\Admin\Vocabulary;

use Illuminate\Foundation\Http\FormRequest;

class ImportVocabularyCsvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ];
    }
}
