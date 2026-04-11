"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { HighlightedExampleText } from "@/components/vocabulary/HighlightedExampleText";
import { VocabularyInlineAudio } from "@/components/vocabulary/VocabularyInlineAudio";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { listBookmarks } from "@/lib/api/bookmarks";
import { ApiError } from "@/lib/api/http";
import { listVocabularies, type UserVocabulary } from "@/lib/api/vocabularies";

type QuizMode = "kr-to-ja" | "ja-to-kr";
type QuizSource = "all" | "bookmarks";
type Phase = "setup" | "playing" | "finished";

const LEVEL_OPTIONS = [
  { value: "", label: "すべて" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}級` })),
];

const COUNT_OPTIONS = [
  { value: 10, label: "10問" },
  { value: 20, label: "20問" },
  { value: 50, label: "50問" },
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

export default function QuizPage() {
  const { state, refreshMe } = useAuth();

  // ── setup state ──────────────────────────────────────────
  const [mode, setMode] = useState<QuizMode>("kr-to-ja");
  const [source, setSource] = useState<QuizSource>("all");
  const [levelFilter, setLevelFilter] = useState("");
  const [count, setCount] = useState(20);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── quiz state ───────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("setup");
  const [cards, setCards] = useState<UserVocabulary[]>([]);
  /** スタート／「もう一度（全問）」時のデッキ。「わからなかっただけ」後も上書きしない */
  const [fullRoundDeck, setFullRoundDeck] = useState<UserVocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ card: UserVocabulary; correct: boolean }[]>([]);

  useEffect(() => {
    if (state.status === "loading") refreshMe().catch(() => undefined);
  }, [refreshMe, state.status]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (source === "bookmarks" && state.status !== "authed") {
        setLoadError(
          "ブックマークのみの出題には会員登録が必要です。無料で登録すると、保存した語彙だけを練習できます。",
        );
        setLoading(false);
        return;
      }

      let pool: UserVocabulary[];
      const token = state.status === "authed" ? state.token : null;

      if (source === "bookmarks" && state.status === "authed") {
        const res = await listBookmarks(state.token);
        pool = res.bookmarks;
      } else {
        const res = await listVocabularies(token, {
          level: levelFilter ? Number(levelFilter) : undefined,
        });
        pool = res.vocabularies;
      }

      if (pool.length === 0) {
        setLoadError("出題できる語彙がありません。絞り込みを変更してください。");
        setLoading(false);
        return;
      }

      const picked = count > 0 ? shuffle(pool).slice(0, count) : shuffle(pool);
      const deck = [...picked];
      setFullRoundDeck(deck);
      setCards(deck);
      setIndex(0);
      setFlipped(false);
      setResults([]);
      setPhase("playing");
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "語彙の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [state, source, levelFilter, count]);

  const answer = useCallback(
    (correct: boolean) => {
      setResults((prev) => [...prev, { card: cards[index], correct }]);
      if (index + 1 < cards.length) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else {
        setPhase("finished");
      }
    },
    [cards, index],
  );

  const retry = useCallback(
    (wrongOnly: boolean) => {
      const pool = wrongOnly
        ? results.filter((r) => !r.correct).map((r) => r.card)
        : fullRoundDeck.length > 0
          ? fullRoundDeck
          : cards;
      setCards(shuffle(pool));
      setIndex(0);
      setFlipped(false);
      setResults([]);
      setPhase("playing");
    },
    [cards, fullRoundDeck, results],
  );

  const correctCount = useMemo(() => results.filter((r) => r.correct).length, [results]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10">
        <div className="text-sm text-white/80">読み込み中...</div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // SETUP
  // ════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl">
              フラッシュカード
              <span className="ml-2 align-baseline text-lg font-semibold text-white/85">플래시카드</span>
            </h1>
            <p className="mt-1 text-sm text-white/80">
              ランダム出題。答えを見てから「わからない」「わかった」で次へ進みます。
            </p>
          </div>

          <Section
            title="設定"
            subtitle="설정"
            headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
            titleClassName="text-white drop-shadow-sm"
          >
            <Card className="space-y-5 border-white/10 bg-white/10 text-white backdrop-blur">
              {/* 出題モード */}
              <div>
                <div className="text-sm font-semibold text-white">
                  出題モード <span className="ml-1 text-white/70">출제 방향</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Chip
                    type="button"
                    selected={mode === "kr-to-ja"}
                    onClick={() => setMode("kr-to-ja")}
                  >
                    🇰🇷 → 🇯🇵
                  </Chip>
                  <Chip
                    type="button"
                    selected={mode === "ja-to-kr"}
                    onClick={() => setMode("ja-to-kr")}
                  >
                    🇯🇵 → 🇰🇷
                  </Chip>
                </div>
              </div>

              {/* 出題元 */}
              <div>
                <div className="text-sm font-semibold text-white">
                  出題元 <span className="ml-1 text-white/70">출제 범위</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Chip
                    type="button"
                    selected={source === "all"}
                    onClick={() => {
                      setSource("all");
                      setLoadError(null);
                    }}
                  >
                    全語彙
                  </Chip>
                  <Chip
                    type="button"
                    selected={source === "bookmarks"}
                    onClick={() => {
                      setSource("bookmarks");
                      setLoadError(null);
                    }}
                  >
                    🔖 ブックマークのみ
                  </Chip>
                </div>
                {state.status === "guest" && source === "bookmarks" ? (
                  <div className="mt-3 rounded-xl border border-amber-300/35 bg-amber-500/15 px-3 py-3 text-sm leading-relaxed text-white/95 ring-1 ring-amber-200/20">
                    <p className="font-semibold text-amber-50">会員登録でご利用いただけます</p>
                    <p className="mt-1.5 text-white/85">
                      ブックマークに保存した語彙だけを出題するには、
                      <strong className="text-white">無料の会員登録</strong>
                      が必要です。登録後はログインしてお楽しみください。
                    </p>
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      <Link className="font-semibold text-white underline underline-offset-2" href="/register">
                        会員登録（無料）
                      </Link>
                      <span className="text-white/50">|</span>
                      <Link className="font-semibold text-white/90 underline underline-offset-2" href="/login">
                        ログイン
                      </Link>
                    </p>
                  </div>
                ) : null}
              </div>

              {/* レベル絞り込み（全語彙のみ） */}
              {source === "all" ? (
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
                        onClick={() => setLevelFilter(levelFilter === o.value ? "" : o.value)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}

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

              <Button
                className="w-full"
                type="button"
                disabled={loading || (state.status === "guest" && source === "bookmarks")}
                onClick={() => startQuiz()}
              >
                {loading ? "読み込み中..." : "スタート 시작"}
              </Button>
            </Card>
          </Section>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // PLAYING
  // ════════════════════════════════════════
  if (phase === "playing") {
    const card = cards[index];
    const progress = Math.round(((index + 1) / cards.length) * 100);
    const question = mode === "kr-to-ja" ? card.term : card.meaning_ja;
    const answer1 = mode === "kr-to-ja" ? card.meaning_ja : card.term;

    return (
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
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
              {index + 1} / {cards.length}
            </div>
          </div>

          {/* プログレスバー */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/70 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* フラッシュカード（3D めくり） */}
          <div className="[perspective:1100px]">
            <button
              type="button"
              onClick={() => setFlipped(true)}
              disabled={flipped}
              aria-pressed={flipped}
              aria-label={flipped ? "答え表示済み" : "カードをめくって答えを表示"}
              className={[
                "group relative block w-full min-h-[13.5rem] rounded-2xl p-0 text-left",
                "outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600/80",
                flipped ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <div
                key={card.id}
                className="relative min-h-[13.5rem] w-full [transform-style:preserve-3d] will-change-transform"
                style={{
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.65s cubic-bezier(0.4, 0.15, 0.2, 1)",
                }}
              >
                {/* 表面（問題） */}
                <div
                  className={[
                    "absolute inset-0 flex min-h-[13.5rem] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl px-4 py-8 text-center",
                    "border border-white/20 bg-gradient-to-br from-white/20 via-white/10 to-teal-900/30",
                    "shadow-[0_22px_48px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]",
                    "backdrop-blur-md [backface-visibility:hidden] [transform:translateZ(0.1px)]",
                    "ring-1 ring-white/10",
                  ].join(" ")}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-70"
                  />
                  <div className="relative text-xs font-semibold tracking-wide text-white/55">
                    {card.level_label_ja}
                  </div>
                  <div className="relative text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
                    {question}
                  </div>
                  {card.audio_url ? (
                    <div className="relative w-full max-w-xs px-2" onClick={(e) => e.stopPropagation()}>
                      <VocabularyInlineAudio src={card.audio_url} className="[&_audio]:h-8 [&_audio]:opacity-90" />
                    </div>
                  ) : null}
                  <div className="relative text-sm text-white/65">
                    タップでめくる
                    <span className="mt-1 block text-xs text-white/45">탭하여 뒤집기</span>
                  </div>
                </div>
                {/* 裏面（答え） */}
                <div
                  className={[
                    "absolute inset-0 flex min-h-[13.5rem] flex-col items-center justify-center gap-3 overflow-y-auto rounded-2xl px-4 py-8 text-center",
                    "border border-emerald-200/25 bg-gradient-to-br from-teal-900/85 via-teal-800/70 to-sky-900/80",
                    "shadow-[0_22px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]",
                    "backdrop-blur-md [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]",
                    "ring-1 ring-emerald-300/15",
                  ].join(" ")}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-black/20"
                  />
                  <div className="relative text-xs font-semibold text-emerald-100/70">
                    {card.level_label_ja}
                  </div>
                  <div className="relative text-2xl font-bold text-white/80">{question}</div>
                  <div className="relative text-3xl font-extrabold text-white drop-shadow-md sm:text-4xl">
                    {answer1}
                  </div>
                  {card.example_sentence ? (
                    <div className="relative mt-1 max-w-xs space-y-1.5 text-base leading-snug text-white/80">
                      <div className="flex gap-1.5">
                        <span aria-hidden>🇰🇷</span>
                        <span>
                          <HighlightedExampleText
                            text={card.example_sentence}
                            markClassName="font-semibold text-white underline decoration-amber-200/90 decoration-2 underline-offset-[0.2em]"
                          />
                        </span>
                      </div>
                      {card.example_translation_ja ? (
                        <div className="flex gap-1.5">
                          <span aria-hidden>🇯🇵</span>
                          <span>
                            <HighlightedExampleText
                              text={card.example_translation_ja}
                              markClassName="font-semibold text-white/95 underline decoration-emerald-200/85 decoration-2 underline-offset-[0.2em]"
                            />
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          </div>

          {/* 自己評価（次のカードへ） */}
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-xl bg-red-500/30 px-4 py-4 text-center font-semibold text-white ring-1 ring-red-400/40 transition-colors hover:bg-red-500/40"
              >
                <div className="text-xl">🤔</div>
                <div className="mt-1 text-sm">わからない</div>
                <div className="text-xs text-white/70">모르겠어요</div>
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-xl bg-emerald-500/30 px-4 py-4 text-center font-semibold text-white ring-1 ring-emerald-400/40 transition-colors hover:bg-emerald-500/40"
              >
                <div className="text-xl">✅</div>
                <div className="mt-1 text-sm">わかった</div>
                <div className="text-xs text-white/70">알겠어요</div>
              </button>
            </div>
          ) : (
            <div className="h-[88px]" />
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // FINISHED
  // ════════════════════════════════════════
  const wrongCards = results.filter((r) => !r.correct);
  const scorePercent = Math.round((correctCount / results.length) * 100);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
            結果
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">결과</span>
          </h1>
        </div>

        {/* スコア */}
        <Card className="border-white/10 bg-white/10 text-center text-white backdrop-blur">
          <div className="py-4">
            <div className="text-6xl font-extrabold drop-shadow-sm">{scorePercent}%</div>
            <div className="mt-2 text-lg font-semibold text-white/80">
              {results.length}問中「わかった」{correctCount}問
            </div>
            <div className="text-sm text-white/60">
              {results.length}문제 중 「알겠어요」 {correctCount}문제
            </div>
          </div>
        </Card>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => retry(false)}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/15"
          >
            🔄 もう一度
            <div className="text-xs font-normal text-white/70">처음부터</div>
          </button>
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => retry(true)}
              className="rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-white ring-1 ring-red-400/30 hover:bg-red-500/30"
            >
              🤔 わからなかった {wrongCards.length}問
              <div className="text-xs font-normal text-white/70">모르겠던 것만</div>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/15"
          >
            ⚙️ 設定に戻る
            <div className="text-xs font-normal text-white/70">설정으로</div>
          </button>
        </div>

        {/* 間違えた単語一覧 */}
        {wrongCards.length > 0 ? (
          <Section
            title="わからなかった語彙"
            subtitle="모르겠던 단어"
            headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
            titleClassName="text-white drop-shadow-sm"
          >
            <div className="space-y-2">
              {wrongCards.map(({ card }) => (
                <Link key={card.id} href={`/vocabularies/${card.id}`}>
                  <Card className="border-white/10 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/15">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold">{card.term}</div>
                        <div className="text-sm text-white/70">{card.meaning_ja}</div>
                      </div>
                      <div className="text-xs text-white/60">{card.level_label_ja}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Section>
        ) : (
          <Card className="border-white/10 bg-emerald-500/20 text-center text-white backdrop-blur ring-1 ring-emerald-400/30">
            <div className="py-2 text-sm font-semibold">🎉 すべて「わかった」です！완벽해요!</div>
          </Card>
        )}
      </div>
    </div>
  );
}
