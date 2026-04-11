<?php

declare(strict_types=1);

namespace Tests\Feature\PlannedFeature;

use App\Models\PlannedFeature;
use Illuminate\Support\Str;
use Tests\TestCase;

class PlannedFeatureApiTest extends TestCase
{
    public function test_index_returns_only_published_planned_features_ordered(): void
    {
        PlannedFeature::query()->create([
            'id' => (string) Str::ulid(),
            'title_ja' => 'Zebra 後ろ',
            'summary_ja' => '並び順テスト用',
            'subtitle_ko' => null,
            'sort_order' => 99,
            'is_published' => true,
        ]);
        PlannedFeature::query()->create([
            'id' => (string) Str::ulid(),
            'title_ja' => 'Alpha 先頭',
            'summary_ja' => null,
            'subtitle_ko' => '서브',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        PlannedFeature::query()->create([
            'id' => (string) Str::ulid(),
            'title_ja' => '非公開',
            'summary_ja' => null,
            'subtitle_ko' => null,
            'sort_order' => 0,
            'is_published' => false,
        ]);

        $res = $this->getJson('/api/v1/planned-features', ['Accept' => 'application/json']);

        $res->assertOk();
        $list = $res->json('planned_features');
        $this->assertCount(2, $list);
        $this->assertSame('Alpha 先頭', $list[0]['title_ja']);
        $this->assertSame('Zebra 後ろ', $list[1]['title_ja']);
        $res->assertJsonStructure([
            'planned_features' => [[
                'id',
                'title_ja',
                'summary_ja',
                'subtitle_ko',
                'sort_order',
            ]],
        ]);
    }
}
