<?php

namespace App\Http\Requests\Api\V1\Admin\Vocabulary;

use Illuminate\Foundation\Http\FormRequest;

class StoreVocabularyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'term' => ['required', 'string', 'min:1', 'max:255'],
            'meaning_ja' => ['required', 'string', 'min:1', 'max:255'],
            'pos' => ['required', 'string', 'in:noun,verb,adj,adv,particle,determiner,pronoun,interjection,other'],
            'level' => ['required', 'integer', 'min:1', 'max:6'],
            'entry_type' => ['nullable', 'string', 'in:word,phrase,idiom'],
            'example_sentence' => ['nullable', 'string'],
            'example_translation_ja' => ['nullable', 'string'],
            'audio_url' => ['nullable', 'string', 'max:2048'],
            'example_audio_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
        ];
    }
}
