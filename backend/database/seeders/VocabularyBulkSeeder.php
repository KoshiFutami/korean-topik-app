<?php

namespace Database\Seeders;

use App\Models\Vocabulary;
use Illuminate\Database\Seeder;
use RuntimeException;

class VocabularyBulkSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/vocabulary_bulk.tsv');

        if (! is_file($path)) {
            throw new RuntimeException("Missing vocabulary data file: {$path}");
        }

        $raw = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($raw === false) {
            throw new RuntimeException("Could not read vocabulary data file: {$path}");
        }

        foreach ($raw as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode("\t", $line);
            if (count($parts) < 5) {
                continue;
            }

            [$term, $meaningJa, $pos, $level, $entryType] = $parts;
            $item = [
                'term' => $term,
                'meaning_ja' => $meaningJa,
                'pos' => $pos,
                'level' => (int) $level,
                'entry_type' => $entryType !== '' ? $entryType : 'word',
                'example_sentence' => null,
                'example_translation_ja' => null,
                'audio_url' => null,
                'status' => 'published',
            ];

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
