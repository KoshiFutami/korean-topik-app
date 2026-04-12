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

    public function labelJa(): string
    {
        return match ($this) {
            self::NOUN => '名詞',
            self::VERB => '動詞',
            self::ADJECTIVE => '形容詞',
            self::ADVERB => '副詞',
            self::PARTICLE => '助詞',
            self::DETERMINER => '冠形詞',
            self::PRONOUN => '代名詞',
            self::INTERJECTION => '感動詞',
            self::OTHER => 'その他',
        };
    }
}
