<?php

namespace Tests\Feature\Question;

use App\Models\TopikQuestion;
use App\Models\TopikQuestionOption;
use Tests\TestCase;

class QuestionApiTest extends TestCase
{
    private function createQuestion(int $level = 1, string $type = 'grammar', string $status = 'published'): TopikQuestion
    {
        /** @var TopikQuestion $question */
        $question = TopikQuestion::query()->create([
            'level' => $level,
            'question_type' => $type,
            'question_text' => '저는 학교___ 가요.',
            'explanation_ja' => '「에」は目的地を表す助詞です。',
            'status' => $status,
        ]);

        $options = [
            ['option_number' => 1, 'text' => '에', 'is_correct' => true],
            ['option_number' => 2, 'text' => '에서', 'is_correct' => false],
            ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
            ['option_number' => 4, 'text' => '으로', 'is_correct' => false],
        ];

        foreach ($options as $o) {
            TopikQuestionOption::query()->create([
                'question_id' => $question->id,
                'option_number' => $o['option_number'],
                'text' => $o['text'],
                'is_correct' => $o['is_correct'],
            ]);
        }

        return $question;
    }

    public function test_index_returns_only_published_questions(): void
    {
        $this->createQuestion(level: 1, status: 'published');
        $this->createQuestion(level: 1, status: 'draft');

        $res = $this->getJson('/api/v1/questions', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertCount(1, $res->json('questions'));
    }

    public function test_index_returns_correct_structure(): void
    {
        $this->createQuestion();

        $res = $this->getJson('/api/v1/questions', ['Accept' => 'application/json']);

        $res->assertOk();
        $res->assertJsonStructure([
            'questions' => [[
                'id',
                'level',
                'level_label_ja',
                'question_type',
                'question_type_label_ja',
                'question_text',
                'question_text_ja',
                'explanation_ja',
                'options' => [[
                    'option_number',
                    'text',
                    'text_ja',
                ]],
                'correct_option_number',
            ]],
        ]);
    }

    public function test_index_allows_guest_access(): void
    {
        $this->createQuestion();

        $res = $this->getJson('/api/v1/questions', ['Accept' => 'application/json']);

        $res->assertOk();
    }

    public function test_index_filters_by_level(): void
    {
        $this->createQuestion(level: 1);
        $this->createQuestion(level: 2);

        $res = $this->getJson('/api/v1/questions?level=1', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertCount(1, $res->json('questions'));
        $this->assertSame(1, $res->json('questions.0.level'));
    }

    public function test_index_filters_by_type(): void
    {
        $this->createQuestion(type: 'grammar');

        $res = $this->getJson('/api/v1/questions?type=grammar', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertCount(1, $res->json('questions'));
        $this->assertSame('grammar', $res->json('questions.0.question_type'));
    }

    public function test_index_returns_correct_option_number(): void
    {
        $this->createQuestion();

        $res = $this->getJson('/api/v1/questions', ['Accept' => 'application/json']);

        $res->assertOk();
        $this->assertSame(1, $res->json('questions.0.correct_option_number'));
        $this->assertSame('에', $res->json('questions.0.options.0.text'));
    }
}
