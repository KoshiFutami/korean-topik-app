"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/api/http";
import { listQuestions, type TopikQuestion } from "@/lib/api/questions";

type Phase = "setup" | "playing" | "finished";

const LEVEL_OPTIONS = [
  { value: "", label: "すべて" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}級` })),
];

const TYPE_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "topic", label: "주제 (主題)" },
  { value: "grammar", label: "문법 (文法)" },
];

const COUNT_OPTIONS = [
  { value: 10, label: "10問" },
  { value: 20, label: "20問" },
  { value: 0, label: "全問" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderGrammarQuestionText(text: string) {
  const parts = text.split("( )");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="mx-0.5 inline-block min-w-[3rem] rounded border border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.12)] px-3 py-0.5 text-center font-bold tracking-wider text-[#818cf8]">
              （　　）
            </span>
          )}
        </span>
      ))}
    </>
  );
}

function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
}

function speakKorean(text: string) {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .89 1.02 1.39 1.71.83l9.93-6.86a1 1 0 0 0 0-1.66L9.71 4.31A.998.998 0 0 0 8 5.14Z" />
    </svg>
  );
}

function buildSpeakText(q: TopikQuestion, answered: boolean): string {
  if (!answered) return q.question_text;
  const correctOpt = q.options.find((o) => o.option_number === q.correct_option_number);
  if (!correctOpt) return q.question_text;
  if (q.question_type === "grammar") {
    return q.question_text.replace("( )", correctOpt.text);
  }
  return q.question_text;
}

export default function TopikPracticePage() {
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [count, setCount] = useState(10);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<TopikQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [results, setResults] = useState<{ question: TopikQuestion; correct: boolean }[]>([]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listQuestions({
        level: levelFilter ? Number(levelFilter) : undefined,
        type: typeFilter || undefined,
      });

      if (res.questions.length === 0) {
        setLoadError("出題できる問題がありません。絞り込みを変更してください。");
        setLoading(false);
        return;
      }

      const picked = count > 0 ? shuffle(res.questions).slice(0, count) : shuffle(res.questions);
      setQuestions(picked);
      setIndex(0);
      setSelectedOption(null);
      setResults([]);
      setPhase("playing");
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "問題の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [levelFilter, typeFilter, count]);

  const handleAnswer = useCallback(
    (optionNumber: number) => {
      if (selectedOption !== null) return;
      setSelectedOption(optionNumber);
    },
    [selectedOption],
  );

  const goNext = useCallback(() => {
    if (selectedOption === null) return;
    const q = questions[index];
    const correct = selectedOption === q.correct_option_number;
    const newResults = [...results, { question: q, correct }];

    if (index + 1 < questions.length) {
      setResults(newResults);
      setIndex(index + 1);
      setSelectedOption(null);
    } else {
      setResults(newResults);
      setPhase("finished");
    }
  }, [selectedOption, questions, index, results]);

  const retry = useCallback(
    (wrongOnly: boolean) => {
      const pool = wrongOnly ? results.filter((r) => !r.correct).map((r) => r.question) : questions;
      if (pool.length === 0) return;
      setQuestions(shuffle(pool));
      setIndex(0);
      setSelectedOption(null);
      setResults([]);
      setPhase("playing");
    },
    [results, questions],
  );

  const correctCount = results.filter((r) => r.correct).length;

  // ════════════════════════════════════════
  // SETUP
  // ════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
          style={{ width: 500, height: 300, top: -60, left: "50%", transform: "translateX(-50%)" }}
        />
        <div className="relative mx-auto w-full max-w-lg space-y-6">
          <Section
            title="設定"
            subtitle="설정"
            headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
            titleClassName="text-[#F0F0FF]"
          >
            <Card className="space-y-5 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
              {/* 問題タイプ */}
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)]">
                <div className="border-b border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm font-semibold text-[#F0F0FF]">
                  問題タイプ <span className="ml-1 text-xs font-normal text-[#5C6199]">문제 유형</span>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {TYPE_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={typeFilter === o.value}
                      onClick={() => setTypeFilter(o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* レベル */}
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)]">
                <div className="border-b border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm font-semibold text-[#F0F0FF]">
                  TOPIK レベル <span className="ml-1 text-xs font-normal text-[#5C6199]">토픽 레벨</span>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {LEVEL_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={levelFilter === o.value}
                      onClick={() => setLevelFilter(levelFilter === o.value && o.value !== "" ? "" : o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* 問題数 */}
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)]">
                <div className="border-b border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm font-semibold text-[#F0F0FF]">
                  問題数 <span className="ml-1 text-xs font-normal text-[#5C6199]">문제 수</span>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {COUNT_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={count === o.value}
                      onClick={() => setCount(o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {loadError ? (
                <div className="text-sm font-medium text-[#fb7185]">{loadError}</div>
              ) : null}

              <Button className="w-full" type="button" disabled={loading} onClick={startQuiz}>
                {loading ? "読み込み中..." : "スタート 시작"}
              </Button>
            </Card>
          </Section>

          <div className="text-center">
            <Link href="/quiz" className="text-sm text-[#5C6199] underline underline-offset-2 hover:text-[#9499C4]">
              ← 語彙フラッシュカードへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // PLAYING
  // ════════════════════════════════════════
  if (phase === "playing") {
    const q = questions[index];
    const progress = Math.round(((index + 1) / questions.length) * 100);
    const isAnswered = selectedOption !== null;
    const isCorrect = isAnswered && selectedOption === q.correct_option_number;

    return (
      <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
          style={{ width: 400, height: 250, top: -60, left: "40%", transform: "translateX(-50%)" }}
        />
        <div className="relative mx-auto w-full max-w-lg space-y-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPhase("setup")}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
            >
              <span aria-hidden="true">←</span>
              設定に戻る
            </button>
            <div className="font-mono text-sm font-semibold text-[#5C6199]">
              {index + 1} / {questions.length}
            </div>
          </div>

          {/* プログレスバー */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #3b82f6)",
              }}
            />
          </div>

          {/* 問題カード */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-[#5C6199]">
                  {q.level_label_ja} · {q.question_type_label_ja}
                </div>
                <button
                  type="button"
                  onClick={() => speakKorean(buildSpeakText(q, isAnswered))}
                  disabled={!isSpeechSupported()}
                  className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 text-xs font-medium text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="韓国語を音声で聞く"
                >
                  <PlayGlyph className="h-[0.9rem] w-[0.9rem] shrink-0" />
                  <span>音声</span>
                </button>
              </div>
              <div className="text-xl font-bold leading-relaxed text-[#F0F0FF] sm:text-2xl">
                {q.question_type === "grammar"
                  ? renderGrammarQuestionText(q.question_text)
                  : q.question_text}
              </div>
              {isAnswered && q.question_text_ja ? (
                <div
                  className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#9499C4]"
                  role="note"
                  aria-label="日本語訳"
                >
                  {q.question_text_ja}
                </div>
              ) : null}
              <p className="text-sm text-[#5C6199]">
                {q.question_type === "grammar"
                  ? "（　）に入る最も適切なものを選んでください。"
                  : "무엇에 대한 내용입니까？　何についての内容ですか？"}
              </p>
            </div>
          </div>

          {/* 選択肢 */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isSelected = selectedOption === opt.option_number;
              const isThisCorrect = opt.option_number === q.correct_option_number;

              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.08)";
              let color = "#BCC0E8";

              if (isAnswered) {
                if (isThisCorrect) {
                  bg = "rgba(16,185,129,0.12)";
                  border = "rgba(16,185,129,0.35)";
                  color = "#34d399";
                } else if (isSelected && !isThisCorrect) {
                  bg = "rgba(244,63,94,0.1)";
                  border = "rgba(244,63,94,0.3)";
                  color = "#fb7185";
                } else {
                  bg = "rgba(255,255,255,0.02)";
                  border = "rgba(255,255,255,0.05)";
                  color = "#5C6199";
                }
              } else if (isSelected) {
                bg = "rgba(99,102,241,0.12)";
                border = "rgba(99,102,241,0.4)";
                color = "#818cf8";
              }

              return (
                <button
                  key={opt.option_number}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleAnswer(opt.option_number)}
                  className="relative w-full rounded-xl border px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.7)] backdrop-blur-xl"
                  style={{ background: bg, borderColor: border, color }}
                >
                  <span className="font-mono mr-1.5 text-xs font-bold opacity-60">{opt.option_number}.</span>
                  {opt.text}
                  {isAnswered && opt.text_ja ? (
                    <span className="ml-1.5 text-xs font-normal opacity-70">（{opt.text_ja}）</span>
                  ) : null}
                  {isAnswered && isThisCorrect && (
                    <span className="ml-1.5 text-[#34d399]" aria-hidden="true">✓</span>
                  )}
                  {isAnswered && isSelected && !isThisCorrect && (
                    <span className="ml-1.5 text-[#fb7185]" aria-hidden="true">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 結果フィードバック */}
          {isAnswered ? (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-sm leading-relaxed backdrop-blur-xl",
                isCorrect
                  ? "border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] text-[#34d399]"
                  : "border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.08)] text-[#fb7185]",
              ].join(" ")}
            >
              <p className="font-bold">
                {isCorrect
                  ? "✓ 正解！ 정답!"
                  : `✗ 不正解。正解は「${q.options.find((o) => o.option_number === q.correct_option_number)?.text}」です。`}
              </p>
              {q.explanation_ja ? <p className="mt-1.5 text-[#BCC0E8]">{q.explanation_ja}</p> : null}
            </div>
          ) : null}

          {/* 次へボタン */}
          {isAnswered ? (
            <Button className="w-full" type="button" onClick={goNext}>
              {index + 1 < questions.length ? "次の問題へ →" : "結果を見る →"}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // FINISHED
  // ════════════════════════════════════════
  const wrongCount = results.filter((r) => !r.correct).length;
  const scorePercent = Math.round((correctCount / results.length) * 100);

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
        style={{ width: 500, height: 300, top: -80, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-lg space-y-6">
        {/* スコア */}
        <div
          className="rounded-2xl border border-[rgba(99,102,241,0.25)] p-8 text-center backdrop-blur-xl shadow-[0_0_24px_rgba(99,102,241,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.06))" }}
        >
          <div className="text-lg font-semibold text-[#9499C4]">結果 결과</div>
          <div
            className="mt-2 text-6xl font-extrabold"
            style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            {scorePercent}%
          </div>
          <div className="mt-2 text-base text-[#BCC0E8]">
            {results.length} 問中{" "}
            <span className="font-bold text-[#34d399]">{correctCount} 問</span>{" "}
            正解
          </div>
        </div>

        {/* 復習ボタン */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {wrongCount > 0 ? (
            <Button className="flex-1" type="button" onClick={() => retry(true)}>
              間違えた {wrongCount} 問だけ
            </Button>
          ) : null}
          <Button className="flex-1" type="button" onClick={() => retry(false)}>
            もう一度（全問）
          </Button>
        </div>

        {/* 問題別結果 */}
        <Section
          title="問題別結果"
          subtitle="문제별 결과"
          headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
          titleClassName="text-[#F0F0FF]"
        >
          <div className="space-y-3">
            {results.map((r, i) => {
              const correctOpt = r.question.options.find(
                (o) => o.option_number === r.question.correct_option_number,
              );
              return (
                <div
                  key={r.question.id}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm backdrop-blur-xl",
                    r.correct
                      ? "border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.06)] text-[#F0F0FF]"
                      : "border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.06)] text-[#F0F0FF]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-[#5C6199]">Q{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium leading-relaxed">{r.question.question_text}</span>
                        <button
                          type="button"
                          onClick={() => speakKorean(buildSpeakText(r.question, true))}
                          disabled={!isSpeechSupported()}
                          className="shrink-0 inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-1.5 py-1 text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="韓国語を音声で聞く"
                        >
                          <PlayGlyph className="h-[0.9rem] w-[0.9rem] shrink-0" />
                        </button>
                      </div>
                      {r.question.question_text_ja ? (
                        <div className="mt-0.5 text-xs text-[#5C6199]" role="note" aria-label="日本語訳">
                          {r.question.question_text_ja}
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={["font-bold", r.correct ? "text-[#34d399]" : "text-[#fb7185]"].join(" ")}
                      aria-label={r.correct ? "正解" : "不正解"}
                    >
                      {r.correct ? "✓" : "✗"}
                    </span>
                  </div>
                  {!r.correct ? (
                    <p className="mt-1 text-[#9499C4]">
                      正解:{" "}
                      <span className="font-semibold text-[#34d399]">{correctOpt?.text}</span>
                      {correctOpt?.text_ja ? (
                        <span className="ml-1 text-[rgba(52,211,153,0.7)]">（{correctOpt.text_ja}）</span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm font-semibold text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
          >
            ← 設定に戻る
          </button>
          <Link
            href="/quiz"
            className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-center text-sm font-semibold text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
          >
            語彙クイズへ →
          </Link>
        </div>
      </div>
    </div>
  );
}
