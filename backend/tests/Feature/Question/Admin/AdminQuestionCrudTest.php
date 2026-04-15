<?php

namespace Tests\Feature\Question\Admin;

use App\Models\Admin;
use App\Models\TopikQuestion;
use App\Models\TopikQuestionOption;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminQuestionCrudTest extends TestCase
{
    private function authHeader(): array
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-question@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    private function createQuestion(int $level = 1, string $type = 'grammar', string $status = 'published'): TopikQuestion
    {
        /** @var TopikQuestion $question */
        $question = TopikQuestion::query()->create([
            'level' => $level,
            'question_type' => $type,
            'question_text' => '저는 학교( )가요.',
            'explanation_ja' => '「에」は目的地を表す助詞です。',
            'status' => $status,
        ]);

        foreach ([
            ['option_number' => 1, 'text' => '에', 'is_correct' => true],
            ['option_number' => 2, 'text' => '에서', 'is_correct' => false],
            ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
            ['option_number' => 4, 'text' => '으로', 'is_correct' => false],
        ] as $o) {
            TopikQuestionOption::query()->create([
                'question_id' => $question->id,
                'option_number' => $o['option_number'],
                'text' => $o['text'],
                'is_correct' => $o['is_correct'],
            ]);
        }

        return $question;
    }

    private function validPayload(): array
    {
        return [
            'level' => 2,
            'question_type' => 'grammar',
            'question_text' => '오늘은 날씨가 ( ) 좋아요.',
            'question_text_ja' => null,
            'explanation_ja' => '「매우」は「とても」という意味の副詞です。',
            'status' => 'published',
            'options' => [
                ['option_number' => 1, 'text' => '매우', 'text_ja' => 'とても', 'is_correct' => true],
                ['option_number' => 2, 'text' => '별로', 'text_ja' => 'あまり', 'is_correct' => false],
                ['option_number' => 3, 'text' => '조금', 'text_ja' => '少し', 'is_correct' => false],
                ['option_number' => 4, 'text' => '많이', 'text_ja' => 'たくさん', 'is_correct' => false],
            ],
        ];
    }

    public function test_index_returns_all_questions_for_admin(): void
    {
        $this->createQuestion(status: 'published');
        $this->createQuestion(status: 'draft');

        $res = $this->getJson('/api/v1/admin/questions', $this->authHeader());

        $res->assertOk();
        $this->assertCount(2, $res->json('questions'));
    }

    public function test_index_requires_authentication(): void
    {
        $res = $this->getJson('/api/v1/admin/questions');

        $res->assertUnauthorized();
    }

    public function test_index_returns_correct_structure(): void
    {
        $this->createQuestion();

        $res = $this->getJson('/api/v1/admin/questions', $this->authHeader());

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
                'status',
                'status_label_ja',
                'options' => [['option_number', 'text', 'text_ja', 'is_correct']],
                'correct_option_number',
                'created_at',
            ]],
        ]);
    }

    public function test_show_returns_question(): void
    {
        $question = $this->createQuestion();

        $res = $this->getJson("/api/v1/admin/questions/{$question->id}", $this->authHeader());

        $res->assertOk();
        $res->assertJsonStructure(['question' => ['id', 'level', 'question_type', 'question_text', 'status', 'options']]);
        $this->assertSame((string) $question->id, $res->json('question.id'));
    }

    public function test_show_returns_404_for_nonexistent_question(): void
    {
        $res = $this->getJson('/api/v1/admin/questions/nonexistent-id', $this->authHeader());

        $res->assertNotFound();
    }

    public function test_store_creates_question(): void
    {
        $res = $this->postJson('/api/v1/admin/questions', $this->validPayload(), $this->authHeader());

        $res->assertCreated();
        $res->assertJsonStructure(['question' => ['id', 'level', 'question_type', 'question_text', 'status', 'options', 'correct_option_number']]);
        $this->assertSame(2, $res->json('question.level'));
        $this->assertSame('grammar', $res->json('question.question_type'));
        $this->assertCount(4, $res->json('question.options'));
        $this->assertSame(1, $res->json('question.correct_option_number'));
    }

    public function test_store_requires_authentication(): void
    {
        $res = $this->postJson('/api/v1/admin/questions', $this->validPayload());

        $res->assertUnauthorized();
    }

    public function test_store_validates_required_fields(): void
    {
        $res = $this->postJson('/api/v1/admin/questions', [], $this->authHeader());

        $res->assertUnprocessable();
        $res->assertJsonValidationErrors(['level', 'question_type', 'question_text', 'options']);
    }

    public function test_store_validates_options_array(): void
    {
        $payload = $this->validPayload();
        $payload['options'] = [];

        $res = $this->postJson('/api/v1/admin/questions', $payload, $this->authHeader());

        $res->assertUnprocessable();
    }

    public function test_update_updates_question(): void
    {
        $question = $this->createQuestion();
        $payload = $this->validPayload();
        $payload['question_text'] = '업데이트된 문제입니다.';

        $res = $this->putJson("/api/v1/admin/questions/{$question->id}", $payload, $this->authHeader());

        $res->assertOk();
        $this->assertSame('업데이트된 문제입니다.', $res->json('question.question_text'));
        $this->assertSame(2, $res->json('question.level'));
    }

    public function test_update_returns_404_for_nonexistent_question(): void
    {
        $res = $this->putJson('/api/v1/admin/questions/nonexistent-id', $this->validPayload(), $this->authHeader());

        $res->assertNotFound();
    }

    public function test_destroy_deletes_question(): void
    {
        $question = $this->createQuestion();

        $res = $this->deleteJson("/api/v1/admin/questions/{$question->id}", [], $this->authHeader());

        $res->assertNoContent();
        $this->assertDatabaseMissing('topik_questions', ['id' => $question->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_question(): void
    {
        $res = $this->deleteJson('/api/v1/admin/questions/nonexistent-id', [], $this->authHeader());

        $res->assertNotFound();
    }

    public function test_destroy_requires_authentication(): void
    {
        $question = $this->createQuestion();

        $res = $this->deleteJson("/api/v1/admin/questions/{$question->id}");

        $res->assertUnauthorized();
    }
}
