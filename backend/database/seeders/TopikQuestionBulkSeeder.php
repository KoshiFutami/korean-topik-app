<?php

namespace Database\Seeders;

use App\Models\TopikQuestion;
use App\Models\TopikQuestionOption;
use Illuminate\Database\Seeder;

/**
 * TOPIK 文法問題の初期データを投入する。
 * TOPIK 1 の31〜37番に相当する「빈칸에 들어갈 알맞은 것을 고르세요」形式の問題。
 * question_text 内の「___」が空欄を表す。
 */
class TopikQuestionBulkSeeder extends Seeder
{
    public function run(): void
    {
        $questions = $this->questions();

        foreach ($questions as $q) {
            /** @var TopikQuestion $question */
            $question = TopikQuestion::query()->updateOrCreate(
                [
                    'question_text' => $q['question_text'],
                    'question_type' => $q['question_type'],
                    'level' => $q['level'],
                ],
                [
                    'level' => $q['level'],
                    'question_type' => $q['question_type'],
                    'question_text' => $q['question_text'],
                    'explanation_ja' => $q['explanation_ja'] ?? null,
                    'status' => 'published',
                ],
            );

            foreach ($q['options'] as $optionData) {
                TopikQuestionOption::query()->updateOrCreate(
                    [
                        'question_id' => $question->id,
                        'option_number' => $optionData['option_number'],
                    ],
                    [
                        'question_id' => $question->id,
                        'option_number' => $optionData['option_number'],
                        'text' => $optionData['text'],
                        'is_correct' => $optionData['is_correct'],
                    ],
                );
            }
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function questions(): array
    {
        return [
            // ── TOPIK 1（1〜2級）文法問題 ────────────────────────────────────────
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 학교___ 가요.',
                'explanation_ja' => '「에」は目的地・方向を表す助詞です。「에서」は場所（行為が行われる場所）、「에게」は人に対する助詞、「으로」は方向・手段を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '에', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '으로', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 회사___ 일해요.',
                'explanation_ja' => '「에서」は行為が行われる場所を表す助詞です。「에」は目的地・時間・存在場所を示し、「에게」は人への助詞、「(으)로」は方向や手段を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '에', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '에서', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '이', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '오늘___ 날씨가 좋아요.',
                'explanation_ja' => '「은/는」は主題・対比を表す助詞です。「이/가」は主語を、「을/를」は目的語を、「의」は所有・所属を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '이', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '은', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '을', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '의', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 사과___ 먹어요.',
                'explanation_ja' => '「를/을」は目的語を表す助詞です。사과（りんご）は母音で終わるので「를」を使います。「이/가」は主語、「은/는」は主題、「에서」は場所を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '이', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '는', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '를', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '에서', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '이것___ 제 가방이에요.',
                'explanation_ja' => '「이/가」は主語を表す助詞です。이것（これ）は子音で終わるので「이」を使います。「은/는」は主題・対比、「을/를」は目的語、「의」は所有を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '이', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '가', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '을', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '에', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '친구___ 선물을 줬어요.',
                'explanation_ja' => '「에게/한테」は人に対して「〜に」を表す助詞です。「에게」は書き言葉・改まった場面でよく使い、「한테」は話し言葉でよく使います。「에서」は場所・出所、「에」は場所・方向を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '에', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '에게', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '이', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 한국어___ 공부해요.',
                'explanation_ja' => '「를/을」は目的語を表す助詞です。한국어（韓国語）は母音で終わるので「를」を使います。「에서」は場所、「에게」は人への助詞、「의」は所有を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '에게', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '의', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '를', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 어제 영화___ 봤어요.',
                'explanation_ja' => '「를/을」は目的語を表す助詞です。영화（映画）は母音で終わるので「를」を使います。「가/이」は主語、「는/은」は主題、「에서」は場所を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '가', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '를', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '는', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 밥을 먹___ 싶어요.',
                'explanation_ja' => '「고 싶다」は「〜したい」という願望を表す表現です。動詞の語幹に「고」をつけます。「서」は理由・継続、「지만」は逆接、「면」は条件を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '고', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '면', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '날씨가 더워___ 에어컨을 켰어요.',
                'explanation_ja' => '「서」は理由・原因を表す接続語尾です。「〜だから〜した」という意味になります。「지만」は逆接（〜だけど）、「면」は条件（〜なら）、「고」は並列（〜して）を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '서', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '면', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 학생___ 아니에요.',
                'explanation_ja' => '「이/가 아니다」は「〜ではない」という否定を表す表現です。학생（学生）は子音で終わるので「이」を使います。「은/는」は主題、「을/를」は目的語、「에서」は場所を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '은', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '을', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '이', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '내일 비가 오___ 우산을 가져오세요.',
                'explanation_ja' => '「(으)면」は条件「〜なら・〜たら」を表す接続語尾です。오다（来る）の語幹「오」に「면」がつきます。「서」は理由、「지만」は逆接、「고」は並列を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '면', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 커피___ 좋아해요.',
                'explanation_ja' => '「를/을」は目的語を表す助詞です。커피（コーヒー）は母音で終わるので「를」を使います。「이/가」は主語、「에서」は場所、「에게」は人への助詞を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '이', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '에서', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '를', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 도서관___ 책을 읽어요.',
                'explanation_ja' => '「에서」は行為が行われる場所を表す助詞です。도서관（図書館）で読む行為が行われるので「에서」を使います。「에」は方向・時間・存在場所、「에게」は人への助詞、「(으)로」は方向・手段を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '에서', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '에', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '에게', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '으로', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 지금 밥을 먹___ 있어요.',
                'explanation_ja' => '「고 있다」は進行形「〜している」を表す表現です。動詞の語幹に「고」をつけます。「서 있다」は「立っている」など状態、「아/어 있다」は状態の継続を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '아', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '어', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '고', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '서', 'is_correct' => false],
                ],
            ],
            // ── TOPIK 2（3〜4級）文法問題 ────────────────────────────────────────
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '회의가 끝나___ 연락할게요.',
                'explanation_ja' => '「(으)면」は条件「〜たら・〜なら」を表す接続語尾です。끝나다（終わる）の語幹「끝나」に「면」がつきます。「서」は理由・順序、「지만」は逆接、「고」は並列を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '면', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '시간이 없___ 택시를 탔어요.',
                'explanation_ja' => '「아서/어서」は理由・原因を表す接続語尾です。없다（ない）は「없어서」になります。「지만」は逆接、「면」は条件、「고」は並列を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '어서', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '면', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '저는 운동___ 건강해졌어요.',
                'explanation_ja' => '「을/를 해서」または「덕분에」の形が自然ですが、ここでは「을 해서（〜をしたので）」の「을」を問う問題です。운동（運動）は子音で終わるので「을」を使います。',
                'options' => [
                    ['option_number' => 1, 'text' => '가', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '는', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '을', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '에서', 'is_correct' => false],
                ],
            ],
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '이 책은 재미있___ 많이 팔렸어요.',
                'explanation_ja' => '「아서/어서」は理由・原因を表す接続語尾です。재미있다（面白い）は「재미있어서」になります。「지만」は逆接（〜だけど）、「면」は条件（〜なら）、「고」は並列（〜して）を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '어서', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '면', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '내일까지 제출해야 하___ 지금 해야 해요.',
                'explanation_ja' => '「아서/어서」はここで「〜ので・〜から」という理由を表す接続語尾として使われています。「지만」は逆接、「면」は条件、「고」は並列を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '면', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '니까', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '고', 'is_correct' => false],
                ],
            ],
        ];
    }
}
