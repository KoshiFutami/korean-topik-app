<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id',
    'level',
    'question_type',
    'question_text',
    'explanation_ja',
    'status',
])]
class TopikQuestion extends Model
{
    use HasUlids;

    protected $table = 'topik_questions';

    protected $keyType = 'string';

    public $incrementing = false;

    public function options(): HasMany
    {
        return $this->hasMany(TopikQuestionOption::class, 'question_id')->orderBy('option_number');
    }
}
