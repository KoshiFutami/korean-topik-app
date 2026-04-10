<?php

declare(strict_types=1);

namespace App\Domain\Vocabulary\ValueObject;

enum PartOfSpeech: string
{
    case NOUN = 'noun';
    case VERB = 'verb';
    case ADJECTIVE = 'adj';
    case ADVERB = 'adv';
    case PARTICLE = 'particle';
    case DETERMINER = 'determiner';
    case PRONOUN = 'pronoun';
    case INTERJECTION = 'interjection';
    case OTHER = 'other';
}

