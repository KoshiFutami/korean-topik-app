<?php

namespace Database\Seeders;

use App\Models\TopikQuestion;
use App\Models\TopikQuestionOption;
use Illuminate\Database\Seeder;

/**
 * TOPIK 問題の初期データを投入する。
 *
 * question_type = 'topic'  : 무엇에 대한 내용입니까？ (Q31〜33 形式)
 *   - question_text に本文の 1〜2 文を格納する。空欄マーカーは不要。
 *
 * question_type = 'grammar': 빈칸에 들어갈 알맞은 것을 고르십시오 (Q34〜39 形式)
 *   - question_text 内の「( )」が空欄を表す。
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
            // ── TOPIK 1 主題問題 (Q31〜33 形式) ──────────────────────────────────
            // 무엇에 대한 내용입니까？ — 1〜2 文の内容が何について書かれているかを選ぶ
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 영국 사람입니다. 친구는 중국 사람입니다.',
                'explanation_ja' => '「영국 사람（イギリス人）」「중국 사람（中国人）」など国籍に関する内容なので、「나라（国）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '가족', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '날짜', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '나라', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '학교', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '민수 씨는 의사입니다. 병원에서 일합니다.',
                'explanation_ja' => '「의사（医師）」「병원（病院）」など職業に関する内容なので、「직업（職業）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '요일', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '여행', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '취미', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '직업', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '오늘은 비가 옵니다. 조금 춥습니다.',
                'explanation_ja' => '「비가 옵니다（雨が降ります）」「춥습니다（寒いです）」など天気に関する内容なので、「날씨（天気）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '운동', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '날씨', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '방학', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '계획', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 불고기를 좋아합니다. 매일 먹습니다.',
                'explanation_ja' => '「불고기（プルコギ）」「먹습니다（食べます）」など食べ物に関する内容なので、「음식（食べ物）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '음식', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '운동', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '날씨', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '취미', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 어제 백화점에 갔습니다. 옷을 샀습니다.',
                'explanation_ja' => '「백화점（デパート）」「옷을 샀습니다（服を買いました）」など買い物に関する内容なので、「쇼핑（ショッピング）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '학교', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '쇼핑', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '여행', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '가족', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 축구를 합니다. 주말마다 친구들과 운동장에 갑니다.',
                'explanation_ja' => '「축구（サッカー）」「운동장（グラウンド）」など運動・スポーツに関する内容なので、「운동（運動）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '음식', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '날씨', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '운동', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '여행', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 형과 누나가 있습니다. 우리는 같이 삽니다.',
                'explanation_ja' => '「형（お兄さん）」「누나（お姉さん）」など家族に関する内容なので、「가족（家族）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '가족', 'is_correct' => true],
                    ['option_number' => 2, 'text' => '날짜', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '요일', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '직업', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'topic',
                'question_text' => '저는 한국어를 배웁니다. 학교에서 공부합니다.',
                'explanation_ja' => '「한국어를 배웁니다（韓国語を学びます）」「학교에서 공부합니다（学校で勉強します）」など勉強に関する内容なので、「공부（勉強）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '여행', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '음식', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '공부', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '쇼핑', 'is_correct' => false],
                ],
            ],
            // ── TOPIK 1 文法問題（空欄補充）(Q34〜39 形式) ───────────────────────
            // ( ) に入る最も適切な語句を選ぶ
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '( )에 갑니다. 책을 삽니다.',
                'explanation_ja' => '「책을 삽니다（本を買います）」から、本を売っている場所「서점（本屋）」が正解です。「은행（銀行）」「극장（劇場）」「식당（食堂）」は本を買う場所ではありません。',
                'options' => [
                    ['option_number' => 1, 'text' => '은행', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '극장', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '서점', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '식당', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '신발이 ( ). 발이 아픕니다.',
                'explanation_ja' => '「발이 아픕니다（足が痛いです）」から、靴が「작습니다（小さいです）」ために足が痛いという文脈が自然です。',
                'options' => [
                    ['option_number' => 1, 'text' => '같습니다', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '좋습니다', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '작습니다', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '많습니다', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '오후에 약속이 있습니다. 민수 씨를 ( ).',
                'explanation_ja' => '「약속이 있습니다（約束があります）」から、민수 씨と「만납니다（会います）」が自然な流れです。',
                'options' => [
                    ['option_number' => 1, 'text' => '찍습니다', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '배웁니다', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '모릅니다', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '만납니다', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '이것은 제 가방이 아닙니다. 동생( ) 가방입니다.',
                'explanation_ja' => '「동생（弟/妹）」に所有を表す助詞「의」がついて「동생의 가방（弟/妹のかばん）」となります。',
                'options' => [
                    ['option_number' => 1, 'text' => '도', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '의', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '을', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '회사에 일이 많습니다. ( ) 바쁩니다.',
                'explanation_ja' => '「아주（とても）」は形容詞・副詞を修飾します。仕事がたくさんあるので「とても忙しい」という文脈が自然です。「빨리（早く）」「아까（さっき）」「먼저（先に）」は文意に合いません。',
                'options' => [
                    ['option_number' => 1, 'text' => '빨리', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '아까', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '먼저', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '아주', 'is_correct' => true],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '저는 학교( ) 가요.',
                'explanation_ja' => '「에」は目的地・方向を表す助詞です。「에서」は行為が行われる場所、「에게」は人に対する助詞、「으로」は方向・手段を表します。',
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
                'question_text' => '저는 회사( ) 일해요.',
                'explanation_ja' => '「에서」は行為が行われる場所を表す助詞です。「에」は目的地・時間・存在場所、「에게」は人への助詞、「이」は主語を表します。',
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
                'question_text' => '저는 지금 밥을 먹( ) 있어요.',
                'explanation_ja' => '「고 있다」は進行形「〜している」を表す表現です。動詞の語幹に「고」をつけます。「아/어 있다」は状態の継続を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '아', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '어', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '고', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '서', 'is_correct' => false],
                ],
            ],
            [
                'level' => 1,
                'question_type' => 'grammar',
                'question_text' => '날씨가 더워( ) 에어컨을 켰어요.',
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
                'question_text' => '저는 밥을 먹( ) 싶어요.',
                'explanation_ja' => '「고 싶다」は「〜したい」という願望を表す表現です。動詞の語幹に「고」をつけます。「서」は理由・継続、「지만」は逆接、「면」は条件を表します。',
                'options' => [
                    ['option_number' => 1, 'text' => '서', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '지만', 'is_correct' => false],
                    ['option_number' => 3, 'text' => '고', 'is_correct' => true],
                    ['option_number' => 4, 'text' => '면', 'is_correct' => false],
                ],
            ],
            // ── TOPIK 2（3〜4 級）主題問題 ───────────────────────────────────────
            [
                'level' => 2,
                'question_type' => 'topic',
                'question_text' => '저는 여름보다 겨울을 좋아합니다. 눈이 오는 날이 특히 좋습니다.',
                'explanation_ja' => '「여름（夏）」「겨울（冬）」「눈（雪）」など季節・天気に関する内容なので、「계절（季節）」が正解です。',
                'options' => [
                    ['option_number' => 1, 'text' => '취미', 'is_correct' => false],
                    ['option_number' => 2, 'text' => '계절', 'is_correct' => true],
                    ['option_number' => 3, 'text' => '음식', 'is_correct' => false],
                    ['option_number' => 4, 'text' => '여행', 'is_correct' => false],
                ],
            ],
            // ── TOPIK 2（3〜4 級）文法問題（空欄補充）───────────────────────────
            [
                'level' => 2,
                'question_type' => 'grammar',
                'question_text' => '회의가 끝나( ) 연락할게요.',
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
                'question_text' => '시간이 없( ) 택시를 탔어요.',
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
                'question_text' => '내일까지 제출해야 하( ) 지금 해야 해요.',
                'explanation_ja' => '「(으)니까」は理由・根拠を表す接続語尾です。「〜だから〜しなければならない」という文脈に合います。「지만」は逆接、「면」は条件、「고」は並列を表します。',
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
