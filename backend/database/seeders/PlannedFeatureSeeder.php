<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PlannedFeature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlannedFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'title_ja' => '学習進捗・復習スケジュール（SRS）',
                'summary_ja' => '「わかった」の履歴から、次に出すタイミングを自動調整。忘れかけたときに再登場します。',
                'subtitle_ko' => '복습 리듬을 앱이 잡아줘요',
                'sort_order' => 10,
            ],
            [
                'title_ja' => '語彙の発音・リスニング',
                'summary_ja' => 'ネイティブ音声とシャドーイングで、目だけでなく耳からも TOPIK 語彙を定着。',
                'subtitle_ko' => '듣고 따라 말하기',
                'sort_order' => 20,
            ],
            [
                'title_ja' => '学習ストリークとバッジ',
                'summary_ja' => '連続学習日数やクイズ正答率でバッジ獲得。小さな達成感を積み重ねます。',
                'subtitle_ko' => '매일 조금씩, 성취를 모아보세요',
                'sort_order' => 30,
            ],
        ];

        foreach ($items as $row) {
            PlannedFeature::query()->firstOrCreate(
                ['title_ja' => $row['title_ja']],
                [
                    'id' => (string) Str::ulid(),
                    'summary_ja' => $row['summary_ja'],
                    'subtitle_ko' => $row['subtitle_ko'],
                    'sort_order' => $row['sort_order'],
                    'is_published' => true,
                ],
            );
        }
    }
}
