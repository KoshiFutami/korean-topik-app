"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

/** 問題文の「___」を強調スパンに変換する */
function renderQuestionText(text: string) {
  const parts = text.split("___");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="mx-0.5 inline-block rounded border border-white/50 bg-white/20 px-2 py-0.5 font-bold tracking-wider text-amber-200">
              ___
            </span>
          )}
        </span>
      ))}
    </>
  );
}

export default function TopikPracticePage() {
  // ── setup state ──────────────────────────────────────────
  const [levelFilter, setLevelFilter] = useState("");
  const [count, setCount] = useState(10);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── quiz state ───────────────────────────────────────────
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
        type: "grammar",
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
  }, [levelFilter, count]);

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
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-violet-700 via-purple-600 to-indigo-700 px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl">
              TOPIK 問題練習
              <span className="ml-2 align-baseline text-lg font-semibold text-white/85">문제 연습</span>
            </h1>
            <p className="mt-1 text-sm text-white/80">
              文法の空欄補充問題（TOPIK 1 の31〜37番形式）。選択肢から正解を選んでください。
            </p>
          </div>

          <Section
            title="設定"
            subtitle="설정"
            headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
            titleClassName="text-white drop-shadow-sm"
          >
            <Card className="space-y-5 border-white/10 bg-white/10 text-white backdrop-blur">
              {/* レベル絞り込み */}
              <div>
                <div className="text-sm font-semibold text-white">
                  TOPIK レベル <span className="ml-1 text-white/70">토픽 레벨</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
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
              <div>
                <div className="text-sm font-semibold text-white">
                  問題数 <span className="ml-1 text-white/70">문제 수</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
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
                <div className="text-sm font-medium text-red-200">{loadError}</div>
              ) : null}

              <Button className="w-full" type="button" disabled={loading} onClick={startQuiz}>
                {loading ? "読み込み中..." : "スタート 시작"}
              </Button>
            </Card>
          </Section>

          <div className="text-center">
            <Link href="/quiz" className="text-sm text-white/70 underline underline-offset-2 hover:text-white/90">
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
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-violet-700 via-purple-600 to-indigo-700 px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-lg space-y-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPhase("setup")}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/25 hover:bg-white/15"
            >
              <span aria-hidden="true">←</span>
              設定に戻る
            </button>
            <div className="text-sm font-semibold text-white/80">
              {index + 1} / {questions.length}
            </div>
          </div>

          {/* プログレスバー */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/70 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 問題カード */}
          <Card className="border-white/20 bg-white/10 backdrop-blur-md">
            <div className="space-y-4 p-2">
              <div className="text-xs font-semibold text-white/55">
                {q.level_label_ja} · {q.question_type_label_ja}
              </div>
              <div className="text-xl font-bold leading-relaxed text-white sm:text-2xl">
                {renderQuestionText(q.question_text)}
              </div>
              <p className="text-sm text-white/60">빈칸에 들어갈 알맞은 것을 고르세요.</p>
            </div>
          </Card>

          {/* 選択肢 */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isSelected = selectedOption === opt.option_number;
              const isThisCorrect = opt.option_number === q.correct_option_number;

              let btnClass =
                "relative w-full rounded-xl border px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

              if (!isAnswered) {
                btnClass +=
                  " border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 ring-1 ring-white/10";
              } else if (isThisCorrect) {
                btnClass += " border-emerald-300/60 bg-emerald-500/30 text-emerald-100 ring-1 ring-emerald-300/40";
              } else if (isSelected && !isThisCorrect) {
                btnClass += " border-red-300/60 bg-red-500/30 text-red-100 ring-1 ring-red-300/40";
              } else {
                btnClass += " border-white/10 bg-white/5 text-white/50";
              }

              return (
                <button
                  key={opt.option_number}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleAnswer(opt.option_number)}
                  className={btnClass}
                >
                  <span className="mr-1.5 text-xs font-bold opacity-60">{opt.option_number}.</span>
                  {opt.text}
                  {isAnswered && isThisCorrect && (
                    <span className="ml-1.5 text-emerald-300" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {isAnswered && isSelected && !isThisCorrect && (
                    <span className="ml-1.5 text-red-300" aria-hidden="true">
                      ✗
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 結果フィードバック */}
          {isAnswered ? (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-sm leading-relaxed",
                isCorrect
                  ? "border-emerald-300/40 bg-emerald-900/40 text-emerald-100"
                  : "border-red-300/40 bg-red-900/40 text-red-100",
              ].join(" ")}
            >
              <p className="font-bold">
                {isCorrect ? "✓ 正解！ 정답!" : `✗ 不正解。正解は「${q.options.find((o) => o.option_number === q.correct_option_number)?.text}」です。`}
              </p>
              {q.explanation_ja ? <p className="mt-1.5 text-white/80">{q.explanation_ja}</p> : null}
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
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-violet-700 via-purple-600 to-indigo-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* スコア */}
        <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-8 text-center backdrop-blur-md ring-1 ring-white/10">
          <div className="text-lg font-semibold text-white/70">結果 결과</div>
          <div className="mt-2 text-6xl font-extrabold text-white drop-shadow-md">{scorePercent}%</div>
          <div className="mt-2 text-base text-white/80">
            {results.length} 問中 <span className="font-bold text-emerald-300">{correctCount} 問</span> 正解
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
          headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
          titleClassName="text-white drop-shadow-sm"
        >
          <div className="space-y-3">
            {results.map((r, i) => (
              <div
                key={r.question.id}
                className={[
                  "rounded-xl border px-4 py-3 text-sm",
                  r.correct
                    ? "border-emerald-300/30 bg-emerald-900/30 text-white"
                    : "border-red-300/30 bg-red-900/30 text-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white/60">Q{i + 1}.</span>
                  <span className="flex-1 font-medium leading-relaxed">{r.question.question_text}</span>
                  <span
                    className={["font-bold", r.correct ? "text-emerald-300" : "text-red-300"].join(" ")}
                    aria-label={r.correct ? "正解" : "不正解"}
                  >
                    {r.correct ? "✓" : "✗"}
                  </span>
                </div>
                {!r.correct ? (
                  <p className="mt-1 text-white/70">
                    正解:{" "}
                    <span className="font-semibold text-emerald-200">
                      {r.question.options.find((o) => o.option_number === r.question.correct_option_number)?.text}
                    </span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="flex-1 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            ← 設定に戻る
          </button>
          <Link
            href="/quiz"
            className="flex-1 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/20"
          >
            語彙クイズへ →
          </Link>
        </div>
      </div>
    </div>
  );
}
