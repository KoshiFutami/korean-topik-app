<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'id',
    'term',
    'meaning_ja',
    'pos',
    'level',
    'entry_type',
    'example_sentence',
    'example_translation_ja',
    'audio_url',
    'status',
])]
class Vocabulary extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'vocabularies';

    protected $keyType = 'string';

    public $incrementing = false;
}

