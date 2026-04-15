<?php

namespace App\Http\Requests\Api\V1\Admin\Question;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'level' => ['required', 'integer', 'min:1', 'max:6'],
            'question_type' => ['required', 'string', 'in:grammar,topic'],
            'question_text' => ['required', 'string', 'min:1'],
            'question_text_ja' => ['nullable', 'string'],
            'explanation_ja' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'options' => ['required', 'array', 'min:2', 'max:4'],
            'options.*.option_number' => ['required', 'integer', 'min:1', 'max:4'],
            'options.*.text' => ['required', 'string', 'min:1', 'max:255'],
            'options.*.text_ja' => ['nullable', 'string', 'max:255'],
            'options.*.is_correct' => ['required', 'boolean'],
        ];
    }
}
