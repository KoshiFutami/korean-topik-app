"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { HighlightedExampleText } from "@/components/vocabulary/HighlightedExampleText";
import { VocabularyAudioPlayButton } from "@/components/vocabulary/VocabularyAudioPlayButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { addBookmark, listBookmarks, removeBookmark } from "@/lib/api/bookmarks";
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

function LevelBadge({ level }: { level?: number | null }) {
  if (!level) return null;
  const colors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.25)" },
    2: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
    3: { bg: "rgba(99,102,241,0.15)", text: "#818cf8", border: "rgba(99,102,241,0.25)" },
    4: { bg: "rgba(99,102,241,0.15)", text: "#818cf8", border: "rgba(99,102,241,0.25)" },
    5: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    6: { bg: "rgba(244,63,94,0.15)", text: "#fb7185", border: "rgba(244,63,94,0.25)" },
  };
  const c = colors[level] ?? colors[3];
  return (
    <span
      className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] px-2.5 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      LEVEL {level}
    </span>
  );
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
  const [fullRoundDeck, setFullRoundDeck] = useState<UserVocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ card: UserVocabulary; correct: boolean }[]>([]);
  const [cardAnswers, setCardAnswers] = useState<Record<number, boolean>>({});
  const [cardFlipped, setCardFlipped] = useState<Set<number>>(new Set());

  // ── bookmark state (results screen) ─────────────────────
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.status === "loading") refreshMe().catch(() => undefined);
  }, [refreshMe, state.status]);

  useEffect(() => {
    if (phase !== "finished" || state.status !== "authed") return;
    const run = async () => {
      try {
        const res = await listBookmarks(state.token);
        setBookmarkedIds(new Set(res.bookmarks.map((b) => b.id)));
      } catch {
        // ignore
      }
    };
    run().catch(() => undefined);
  }, [phase, state]);

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
      setCardAnswers({});
      setCardFlipped(new Set());
      setPhase("playing");
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "語彙の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [state, source, levelFilter, count]);

  const answer = useCallback(
    (correct: boolean) => {
      const newAnswers = { ...cardAnswers, [index]: correct };
      setCardAnswers(newAnswers);
      if (index + 1 < cards.length) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setFlipped(cardFlipped.has(nextIndex));
      } else {
        const finalResults = cards.map((card, i) => ({
          card,
          correct: newAnswers[i] ?? false,
        }));
        setResults(finalResults);
        setPhase("finished");
      }
    },
    [cards, index, cardAnswers, cardFlipped],
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
      setCardAnswers({});
      setCardFlipped(new Set());
      setPhase("playing");
    },
    [cards, fullRoundDeck, results],
  );

  const goBack = useCallback(() => {
    if (index > 0) {
      const prevIndex = index - 1;
      setIndex(prevIndex);
      setFlipped(cardFlipped.has(prevIndex));
    }
  }, [index, cardFlipped]);

  const goForward = useCallback(() => {
    if (index < cards.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setFlipped(cardFlipped.has(nextIndex));
    }
  }, [index, cards.length, cardFlipped]);

  const handleBookmarkToggle = useCallback(
    async (vocabularyId: string) => {
      if (state.status !== "authed" || bookmarkBusy.has(vocabularyId)) return;
      setBookmarkBusy((prev) => new Set([...prev, vocabularyId]));
      const isBookmarked = bookmarkedIds.has(vocabularyId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.delete(vocabularyId);
        else next.add(vocabularyId);
        return next;
      });
      try {
        if (isBookmarked) {
          await removeBookmark(state.token, vocabularyId);
        } else {
          await addBookmark(state.token, vocabularyId);
        }
      } catch {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (isBookmarked) next.add(vocabularyId);
          else next.delete(vocabularyId);
          return next;
        });
      } finally {
        setBookmarkBusy((prev) => {
          const next = new Set(prev);
          next.delete(vocabularyId);
          return next;
        });
      }
    },
    [state, bookmarkedIds, bookmarkBusy],
  );

  const correctCount = useMemo(() => results.filter((r) => r.correct).length, [results]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10">
        <div className="text-sm text-[#9499C4]">読み込み中...</div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // SETUP
  // ════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
          style={{ width: 500, height: 300, top: -50, left: "50%", transform: "translateX(-50%)" }}
        />
        <div className="relative mx-auto w-full max-w-lg space-y-6">
          <Section
            title="設定"
            subtitle="설정"
            headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
            titleClassName="text-[#F0F0FF]"
          >
            <Card className="space-y-5 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
              {/* 出題モード */}
              <div>
                <div className="border-b border-[rgba(255,255,255,0.08)] pb-2 text-sm font-semibold text-[#F0F0FF]">
                  出題モード <span className="ml-1 text-xs font-normal text-[#5C6199]">출제 방향</span>
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
                <div className="border-b border-[rgba(255,255,255,0.08)] pb-2 text-sm font-semibold text-[#F0F0FF]">
                  出題元 <span className="ml-1 text-xs font-normal text-[#5C6199]">출제 범위</span>
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
                  <div className="mt-3 rounded-xl border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.08)] px-3 py-3 text-sm leading-relaxed text-[#BCC0E8]">
                    <p className="font-semibold text-[#818cf8]">会員登録でご利用いただけます</p>
                    <p className="mt-1.5 text-[#BCC0E8]">
                      ブックマークに保存した語彙だけを出題するには、
                      <strong className="text-[#F0F0FF]">無料の会員登録</strong>
                      が必要です。登録後はログインしてお楽しみください。
                    </p>
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      <Link className="font-semibold text-[#818cf8] underline underline-offset-2" href="/register">
                        会員登録（無料）
                      </Link>
                      <span className="text-[#5C6199]">|</span>
                      <Link className="font-semibold text-[#BCC0E8] underline underline-offset-2" href="/login">
                        ログイン
                      </Link>
                    </p>
                  </div>
                ) : null}
              </div>

              {/* レベル絞り込み */}
              {source === "all" ? (
                <div>
                  <div className="border-b border-[rgba(255,255,255,0.08)] pb-2 text-sm font-semibold text-[#F0F0FF]">
                    TOPIK レベル <span className="ml-1 text-xs font-normal text-[#5C6199]">토픽 레벨</span>
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
                <div className="border-b border-[rgba(255,255,255,0.08)] pb-2 text-sm font-semibold text-[#F0F0FF]">
                  問題数 <span className="ml-1 text-xs font-normal text-[#5C6199]">문제 수</span>
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
                <div className="text-sm font-medium text-[#fb7185]">{loadError}</div>
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
      <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
          style={{ width: 400, height: 300, top: -80, left: "30%", transform: "translateX(-50%)" }}
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
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#5C6199]">{index + 1} / {cards.length}</span>
              <LevelBadge level={card.level} />
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

          {/* フラッシュカード（3D めくり） */}
          <div className="[perspective:1100px]">
            <button
              type="button"
              onClick={() => {
                setFlipped(true);
                setCardFlipped((prev) => new Set([...prev, index]));
              }}
              disabled={flipped}
              aria-pressed={flipped}
              aria-label={flipped ? "答え表示済み" : "カードをめくって答えを表示"}
              className={[
                "group relative block w-full min-h-[14rem] rounded-2xl p-0 text-left",
                "outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08091A]",
                flipped ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <div
                key={card.id}
                className="relative min-h-[14rem] w-full [transform-style:preserve-3d] will-change-transform"
                style={{
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* 表面（問題） */}
                <div
                  className={[
                    "absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl px-4 py-8 text-center",
                    "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                    "backdrop-blur-xl [backface-visibility:hidden] [transform:translateZ(0.1px)]",
                  ].join(" ")}
                >
                  <div className="text-xs font-semibold tracking-wide text-[#5C6199]">
                    {card.level_label_ja}
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-[#F0F0FF] sm:text-5xl">
                    {question}
                  </div>
                  <div className="px-2" onClick={(e) => e.stopPropagation()}>
                    <VocabularyAudioPlayButton
                      vocabularyId={card.id}
                      initialAudioUrl={card.audio_url}
                      avoidNestedButton
                    />
                  </div>
                  <div className="text-sm text-[#5C6199]">
                    タップでめくる
                    <span className="mt-1 block text-xs text-[#5C6199]">탭하여 뒤집기</span>
                  </div>
                </div>

                {/* 裏面（答え） */}
                <div
                  className={[
                    "absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center gap-3 overflow-y-auto rounded-2xl px-4 py-8 text-center",
                    "border border-[rgba(99,102,241,0.25)] backdrop-blur-xl",
                    "[backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]",
                    "shadow-[0_0_24px_rgba(99,102,241,0.2),0_8px_32px_rgba(0,0,0,0.4)]",
                  ].join(" ")}
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))" }}
                >
                  <div className="text-xs font-semibold text-[#9499C4]">
                    {card.level_label_ja}
                  </div>
                  <div className="text-xl font-bold text-[#BCC0E8]">{question}</div>
                  <div className="text-3xl font-extrabold text-[#F0F0FF] sm:text-4xl">{answer1}</div>
                  {card.example_sentence ? (
                    <div className="mt-1 max-w-xs space-y-1.5 text-base leading-snug text-[#BCC0E8]">
                      <div className="flex gap-1.5">
                        <span aria-hidden>🇰🇷</span>
                        <span>
                          <HighlightedExampleText
                            text={card.example_sentence}
                            markClassName="font-semibold text-[#F0F0FF] underline decoration-[#818cf8]/90 decoration-2 underline-offset-[0.2em]"
                          />
                        </span>
                      </div>
                      {card.example_translation_ja ? (
                        <div className="flex gap-1.5">
                          <span aria-hidden>🇯🇵</span>
                          <span>
                            <HighlightedExampleText
                              text={card.example_translation_ja}
                              markClassName="font-semibold text-[#F0F0FF]/95 underline decoration-[#60a5fa]/85 decoration-2 underline-offset-[0.2em]"
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

          {/* 自己評価 */}
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-xl border border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.12)] px-4 py-4 text-center font-semibold text-[#fb7185] transition-colors hover:bg-[rgba(244,63,94,0.2)]"
              >
                <div className="text-sm">몰랐어요</div>
                <div className="mt-0.5 text-xs text-[rgba(251,113,133,0.7)]">わからない</div>
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.12)] px-4 py-4 text-center font-semibold text-[#34d399] transition-colors hover:bg-[rgba(16,185,129,0.2)]"
              >
                <div className="text-sm">알겠어요!</div>
                <div className="mt-0.5 text-xs text-[rgba(52,211,153,0.7)]">わかった</div>
              </button>
            </div>
          ) : (
            <div className="h-[88px]" />
          )}

          {/* 前後ナビゲーション */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={index === 0}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                index === 0
                  ? "cursor-not-allowed border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-[#5C6199]"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]",
              ].join(" ")}
            >
              <span aria-hidden="true">←</span>
              前の問題
            </button>
            {index < cards.length - 1 ? (
              <button
                type="button"
                onClick={goForward}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#BCC0E8] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
              >
                次の問題
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <div />
            )}
          </div>
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
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
        style={{ width: 500, height: 300, top: -80, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-lg space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          結果
          <span className="ml-2 align-baseline text-lg font-semibold text-[#9499C4]">결과</span>
        </h1>

        {/* スコア */}
        <div
          className="rounded-2xl border border-[rgba(99,102,241,0.25)] p-8 text-center backdrop-blur-xl shadow-[0_0_24px_rgba(99,102,241,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.06))" }}
        >
          <div
            className="text-6xl font-extrabold"
            style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            {scorePercent}%
          </div>
          <div className="mt-2 text-lg font-semibold text-[#BCC0E8]">
            {results.length}問中「わかった」{correctCount}問
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${scorePercent}%`,
                background: "linear-gradient(90deg, #6366f1, #3b82f6)",
                transition: "width 400ms ease-out",
              }}
            />
          </div>
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => retry(false)}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm font-semibold text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
          >
            🔄 もう一度
            <div className="text-xs font-normal text-[#5C6199]">처음부터</div>
          </button>
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => retry(true)}
              className="rounded-xl border border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.1)] px-4 py-3 text-sm font-semibold text-[#fb7185] hover:bg-[rgba(244,63,94,0.15)]"
            >
              わからなかった {wrongCards.length}問
              <div className="text-xs font-normal text-[rgba(251,113,133,0.7)]">모르겠던 것만</div>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm font-semibold text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
          >
            設定に戻る
            <div className="text-xs font-normal text-[#5C6199]">설정으로</div>
          </button>
        </div>

        {/* 間違えた単語一覧 */}
        {wrongCards.length > 0 ? (
          <Section
            title="わからなかった語彙"
            subtitle="모르겠던 단어"
            headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
            titleClassName="text-[#F0F0FF]"
          >
            <div className="space-y-2">
              {wrongCards.map(({ card }) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/vocabularies/${card.id}`} className="min-w-0 flex-1">
                      <div className="font-bold text-[#F0F0FF] hover:text-[#818cf8] hover:underline">{card.term}</div>
                      <div className="text-sm text-[#9499C4]">{card.meaning_ja}</div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs text-[#5C6199]">{card.level_label_ja}</span>
                      {state.status === "authed" ? (
                        <button
                          type="button"
                          disabled={bookmarkBusy.has(card.id)}
                          onClick={() => handleBookmarkToggle(card.id)}
                          title={bookmarkedIds.has(card.id) ? "ブックマーク解除" : "ブックマークに追加"}
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-sm border transition-colors",
                            bookmarkedIds.has(card.id)
                              ? "border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.15)] hover:bg-[rgba(99,102,241,0.25)]"
                              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]",
                            bookmarkBusy.has(card.id) ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {bookmarkedIds.has(card.id) ? "🔖" : "🏷️"}
                        </button>
                      ) : state.status === "guest" ? (
                        <button
                          type="button"
                          disabled
                          title="会員登録が必要です"
                          className="inline-flex cursor-not-allowed items-center rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-sm text-[#5C6199]"
                        >
                          🏷️
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {state.status === "guest" ? (
              <p className="mt-3 text-center text-xs text-[#5C6199]">
                <Link href="/login" className="text-[#818cf8] underline underline-offset-2 hover:text-[#60a5fa]">
                  ログイン
                </Link>
                するとブックマークに即時保存できます
              </p>
            ) : null}
          </Section>
        ) : (
          <div className="rounded-xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.1)] p-4 text-center text-sm font-semibold text-[#34d399] backdrop-blur-xl">
            🎉 すべて「わかった」です！완벽해요!
          </div>
        )}
      </div>
    </div>
  );
}
