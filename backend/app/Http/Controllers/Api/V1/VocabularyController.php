<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVocabularyRequest;
use App\Http\Requests\UpdateVocabularyRequest;
use App\Models\Vocabulary;
use Illuminate\Http\JsonResponse;

class VocabularyController extends Controller
{
    public function index(): JsonResponse
    {
        $vocabulary = Vocabulary::orderBy('id', 'desc')->get();

        return response()->json(['data' => $vocabulary]);
    }

    public function store(StoreVocabularyRequest $request): JsonResponse
    {
        $vocabulary = Vocabulary::create($request->validated());

        return response()->json(['data' => $vocabulary], 201);
    }

    public function show(Vocabulary $vocabulary): JsonResponse
    {
        return response()->json(['data' => $vocabulary]);
    }

    public function update(UpdateVocabularyRequest $request, Vocabulary $vocabulary): JsonResponse
    {
        $vocabulary->update($request->validated());

        return response()->json(['data' => $vocabulary]);
    }

    public function destroy(Vocabulary $vocabulary): JsonResponse
    {
        $vocabulary->delete();

        return response()->json(null, 204);
    }
}
