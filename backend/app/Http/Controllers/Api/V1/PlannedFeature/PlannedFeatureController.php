<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\PlannedFeature;

use App\Application\User\PlannedFeature\ListPlannedFeatures\ListPlannedFeaturesInput;
use App\Application\User\PlannedFeature\ListPlannedFeatures\ListPlannedFeaturesUseCase;
use Illuminate\Http\JsonResponse;

class PlannedFeatureController
{
    public function __construct(
        private readonly ListPlannedFeaturesUseCase $listPlannedFeatures,
    ) {}

    public function index(): JsonResponse
    {
        $output = $this->listPlannedFeatures->execute(new ListPlannedFeaturesInput);

        return response()->json([
            'planned_features' => array_map(static fn ($f) => [
                'id' => $f->id,
                'title_ja' => $f->titleJa,
                'summary_ja' => $f->summaryJa,
                'subtitle_ko' => $f->subtitleKo,
                'sort_order' => $f->sortOrder,
            ], $output->plannedFeatures),
        ]);
    }
}
