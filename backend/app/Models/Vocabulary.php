<?php

namespace App\Models;

use Database\Factories\VocabularyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vocabulary extends Model
{
    /** @use HasFactory<VocabularyFactory> */
    use HasFactory;

    protected $table = 'vocabulary';

    protected $fillable = [
        'korean',
        'japanese',
        'level',
        'example_sentence',
    ];
}
