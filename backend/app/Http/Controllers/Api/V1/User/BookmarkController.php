<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Application\User\Bookmark\BookmarkVocabulary\BookmarkVocabularyInput;
use App\Application\User\Bookmark\BookmarkVocabulary\BookmarkVocabularyUseCase;
use App\Application\User\Bookmark\ListBookmarks\ListBookmarksInput;
use App\Application\User\Bookmark\ListBookmarks\ListBookmarksUseCase;
use App\Application\User\Bookmark\UnbookmarkVocabulary\UnbookmarkVocabularyInput;
use App\Application\User\Bookmark\UnbookmarkVocabulary\UnbookmarkVocabularyUseCase;
use App\Domain\Bookmark\Exception\BookmarkAlreadyExistsException;
use App\Domain\Bookmark\Exception\BookmarkNotFoundException;
use App\Domain\Vocabulary\Exception\VocabularyNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\User\Bookmark\BookmarkRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function __construct(
        private readonly ListBookmarksUseCase $listBookmarks,
        private readonly BookmarkVocabularyUseCase $bookmarkVocabulary,
        private readonly UnbookmarkVocabularyUseCase $unbookmarkVocabulary,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $output = $this->listBookmarks->execute(new ListBookmarksInput(
            userId: (string) $request->user()?->getAuthIdentifier(),
        ));

        return response()->json([
            'bookmarks' => array_map(static fn ($v) => [
                'id' => $v->id,
                'term' => $v->term,
                'meaning_ja' => $v->meaningJa,
                'pos' => $v->pos,
                'pos_label_ja' => $v->posLabelJa,
                'level' => $v->level,
                'level_label_ja' => $v->levelLabelJa,
                'entry_type' => $v->entryType,
                'entry_type_label_ja' => $v->entryTypeLabelJa,
                'example_sentence' => $v->exampleSentence,
                'example_translation_ja' => $v->exampleTranslationJa,
                'bookmarked_at' => $v->bookmarkedAt,
            ], $output->vocabularies),
        ]);
    }

    public function store(BookmarkRequest $request): JsonResponse
    {
        try {
            $this->bookmarkVocabulary->execute(new BookmarkVocabularyInput(
                userId: (string) $request->user()?->getAuthIdentifier(),
                vocabularyId: (string) $request->input('vocabulary_id'),
            ));

            return response()->json(['message' => 'ブックマークに追加しました。'], 201);
        } catch (VocabularyNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (BookmarkAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function destroy(Request $request, string $vocabularyId): JsonResponse
    {
        try {
            $this->unbookmarkVocabulary->execute(new UnbookmarkVocabularyInput(
                userId: (string) $request->user()?->getAuthIdentifier(),
                vocabularyId: $vocabularyId,
            ));

            return response()->json(['message' => 'ブックマークを削除しました。']);
        } catch (BookmarkNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
