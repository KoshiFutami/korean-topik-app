<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'id',
    'question_id',
    'option_number',
    'text',
    'text_ja',
    'is_correct',
])]
class TopikQuestionOption extends Model
{
    use HasUlids;

    protected $table = 'topik_question_options';

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'option_number' => 'integer',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(TopikQuestion::class, 'question_id');
    }
}
