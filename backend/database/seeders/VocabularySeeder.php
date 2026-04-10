<?php

namespace Database\Seeders;

use App\Models\Vocabulary;
use Illuminate\Database\Seeder;

class VocabularySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'term' => '먹다',
                'meaning_ja' => '食べる',
                'pos' => 'verb',
                'level' => 1,
                'entry_type' => 'word',
                'example_sentence' => '저는 밥을 먹어요.',
                'example_translation_ja' => '私はご飯を食べます。',
                'status' => 'published',
            ],
            [
                'term' => '마시다',
                'meaning_ja' => '飲む',
                'pos' => 'verb',
                'level' => 1,
                'entry_type' => 'word',
                'example_sentence' => '물을 마셔요.',
                'example_translation_ja' => '水を飲みます。',
                'status' => 'published',
            ],
            [
                'term' => '공부하다',
                'meaning_ja' => '勉強する',
                'pos' => 'verb',
                'level' => 1,
                'entry_type' => 'word',
                'example_sentence' => '한국어를 공부해요.',
                'example_translation_ja' => '韓国語を勉強します。',
                'status' => 'published',
            ],
        ];

        foreach ($items as $item) {
            Vocabulary::query()->firstOrCreate(
                [
                    'term' => $item['term'],
                    'pos' => $item['pos'],
                    'meaning_ja' => $item['meaning_ja'],
                ],
                $item,
            );
        }
    }
}
