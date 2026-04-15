<?php

declare(strict_types=1);

namespace App\Infrastructure\Question\Repository;

use App\Domain\Question\Entity\QuestionOption;
use App\Domain\Question\Entity\TopikQuestion;
use App\Domain\Question\Repository\QuestionRepositoryInterface;
use App\Domain\Question\ValueObject\QuestionId;
use App\Domain\Question\ValueObject\QuestionStatus;
use App\Domain\Question\ValueObject\QuestionType;
use App\Models\TopikQuestion as EloquentTopikQuestion;
use App\Models\TopikQuestionOption as EloquentTopikQuestionOption;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class EloquentQuestionRepository implements QuestionRepositoryInterface
{
    public function list(): array
    {
        return EloquentTopikQuestion::query()
            ->with(['options'])
            ->orderBy('level')
            ->orderBy('created_at')
            ->get()
            ->map(static fn (EloquentTopikQuestion $m): TopikQuestion => self::toEntity($m))
            ->all();
    }

    public function findById(QuestionId $id): ?TopikQuestion
    {
        $model = EloquentTopikQuestion::query()
            ->with(['options'])
            ->find($id->value());

        return $model ? self::toEntity($model) : null;
    }

    public function save(TopikQuestion $question): void
    {
        DB::transaction(function () use ($question): void {
            EloquentTopikQuestion::query()->updateOrCreate(
                ['id' => $question->id()->value()],
                [
                    'level' => $question->level(),
                    'question_type' => $question->questionType()->value,
                    'question_text' => $question->questionText(),
                    'question_text_ja' => $question->questionTextJa(),
                    'explanation_ja' => $question->explanationJa(),
                    'status' => $question->status()->value,
                ],
            );

            EloquentTopikQuestionOption::query()
                ->where('question_id', $question->id()->value())
                ->delete();

            foreach ($question->options() as $option) {
                EloquentTopikQuestionOption::query()->create([
                    'question_id' => $question->id()->value(),
                    'option_number' => (int) $option->optionNumber(),
                    'text' => $option->text(),
                    'text_ja' => $option->textJa(),
                    'is_correct' => $option->isCorrect(),
                ]);
            }
        });
    }

    public function delete(QuestionId $id): void
    {
        EloquentTopikQuestion::query()->whereKey($id->value())->delete();
    }

    public function listByStatus(
        QuestionStatus $status,
        ?int $level = null,
        ?QuestionType $questionType = null,
    ): array {
        $query = EloquentTopikQuestion::query()
            ->with(['options'])
            ->where('status', $status->value);

        if ($level !== null) {
            $query->where('level', $level);
        }

        if ($questionType !== null) {
            $query->where('question_type', $questionType->value);
        }

        return $query->orderBy('level')
            ->orderBy('created_at')
            ->get()
            ->map(static fn (EloquentTopikQuestion $m): TopikQuestion => self::toEntity($m))
            ->all();
    }

    private static function toEntity(EloquentTopikQuestion $m): TopikQuestion
    {
        $options = $m->options->map(static fn ($o): QuestionOption => new QuestionOption(
            optionNumber: (string) $o->option_number,
            text: (string) $o->text,
            textJa: $o->text_ja !== null ? (string) $o->text_ja : null,
            isCorrect: (bool) $o->is_correct,
        ))->all();

        return TopikQuestion::reconstruct(
            id: QuestionId::from((string) $m->id),
            level: (int) $m->level,
            questionType: QuestionType::from((string) $m->question_type),
            questionText: (string) $m->question_text,
            questionTextJa: $m->question_text_ja !== null ? (string) $m->question_text_ja : null,
            explanationJa: $m->explanation_ja !== null ? (string) $m->explanation_ja : null,
            status: QuestionStatus::from((string) $m->status),
            options: $options,
            createdAt: new DateTimeImmutable((string) $m->created_at),
        );
    }
}
