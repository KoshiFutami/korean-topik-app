<?php

namespace Database\Seeders;

use App\Models\Vocabulary;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * vocabulary_bulk.csv（UTF-8）を投入する。
 * example_sentence / example_translation_ja では «…»（U+2039, U+203A）で囲んだ部分をフロントで強調表示する。
 */
class VocabularyBulkSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/vocabulary_bulk.csv');

        if (! is_file($path)) {
            throw new RuntimeException("Missing vocabulary data file: {$path}");
        }

        $raw = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($raw === false) {
            throw new RuntimeException("Could not read vocabulary data file: {$path}");
        }

        foreach ($raw as $line) {
            if (str_starts_with($line, "\xEF\xBB\xBF")) {
                $line = substr($line, 3);
            }
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = str_getcsv($line);
            if (count($parts) < 5) {
                continue;
            }

            if (($parts[0] ?? '') === 'term') {
                continue;
            }

            [$term, $meaningJa, $pos, $level, $entryType] = $parts;
            $exampleSentence = $parts[5] ?? '';
            $exampleTranslationJa = $parts[6] ?? '';

            $item = [
                'term' => $term,
                'meaning_ja' => $meaningJa,
                'pos' => $pos,
                'level' => (int) $level,
                'entry_type' => $entryType !== '' ? $entryType : 'word',
                'example_sentence' => $exampleSentence !== '' ? $exampleSentence : null,
                'example_translation_ja' => $exampleTranslationJa !== '' ? $exampleTranslationJa : null,
                'audio_url' => null,
                'status' => 'published',
            ];

            Vocabulary::query()->updateOrCreate(
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
