<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $title_ja
 * @property string|null $summary_ja
 * @property string|null $subtitle_ko
 * @property int $sort_order
 * @property bool $is_published
 */
class PlannedFeature extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title_ja',
        'summary_ja',
        'subtitle_ko',
        'sort_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
