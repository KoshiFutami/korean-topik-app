<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Vocabulary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VocabularyTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    public function test_unauthenticated_user_cannot_access_vocabulary(): void
    {
        $response = $this->getJson('/api/v1/vocabulary');

        $response->assertUnauthorized();
    }

    public function test_index_returns_vocabulary_list(): void
    {
        $this->actingAsUser();
        Vocabulary::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/vocabulary');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'korean', 'japanese', 'level', 'example_sentence']],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_store_creates_vocabulary_and_returns_201(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/v1/vocabulary', [
            'korean' => '안녕하세요',
            'japanese' => 'こんにちは',
            'level' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['korean' => '안녕하세요']);
        $this->assertDatabaseHas('vocabulary', ['korean' => '안녕하세요']);
    }

    public function test_store_with_example_sentence(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/v1/vocabulary', [
            'korean' => '감사합니다',
            'japanese' => 'ありがとうございます',
            'level' => 2,
            'example_sentence' => '정말 감사합니다.',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['example_sentence' => '정말 감사합니다.']);
        $this->assertDatabaseHas('vocabulary', ['korean' => '감사합니다']);
    }

    public function test_store_requires_korean_field(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/v1/vocabulary', [
            'japanese' => 'こんにちは',
            'level' => 1,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['korean']);
    }

    public function test_store_requires_level_between_1_and_6(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/v1/vocabulary', [
            'korean' => '안녕하세요',
            'japanese' => 'こんにちは',
            'level' => 7,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['level']);
    }

    public function test_show_returns_vocabulary(): void
    {
        $this->actingAsUser();
        $vocabulary = Vocabulary::factory()->create();

        $response = $this->getJson("/api/v1/vocabulary/{$vocabulary->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $vocabulary->id]);
    }

    public function test_show_returns_404_for_nonexistent_vocabulary(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/v1/vocabulary/999');

        $response->assertNotFound();
    }

    public function test_update_modifies_vocabulary(): void
    {
        $this->actingAsUser();
        $vocabulary = Vocabulary::factory()->create(['korean' => '안녕']);

        $response = $this->putJson("/api/v1/vocabulary/{$vocabulary->id}", [
            'korean' => '안녕하세요',
            'japanese' => 'こんにちは',
            'level' => 2,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['korean' => '안녕하세요']);
        $this->assertDatabaseHas('vocabulary', ['korean' => '안녕하세요']);
    }

    public function test_update_can_partial_update(): void
    {
        $this->actingAsUser();
        $vocabulary = Vocabulary::factory()->create(['level' => 1]);

        $response = $this->patchJson("/api/v1/vocabulary/{$vocabulary->id}", [
            'level' => 3,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['level' => 3]);
    }

    public function test_destroy_deletes_vocabulary(): void
    {
        $this->actingAsUser();
        $vocabulary = Vocabulary::factory()->create();

        $response = $this->deleteJson("/api/v1/vocabulary/{$vocabulary->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('vocabulary', ['id' => $vocabulary->id]);
    }
}
