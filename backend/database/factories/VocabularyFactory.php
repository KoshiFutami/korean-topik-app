<?php

namespace Database\Factories;

use App\Models\Vocabulary;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vocabulary>
 */
class VocabularyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $koreanWords = ['안녕하세요', '감사합니다', '사랑해요', '학교', '가다', '오다', '먹다', '마시다', '공부하다', '일하다'];

        return [
            'korean' => $this->faker->randomElement($koreanWords),
            'japanese' => $this->faker->word(),
            'level' => $this->faker->numberBetween(1, 6),
            'example_sentence' => $this->faker->optional()->sentence(),
        ];
    }
}
