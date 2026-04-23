"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

type NumberCategory = "year" | "month" | "day" | "hour" | "minute" | "won" | "native" | "sino" | "age" | "item" | "cup";
type QuizMode = "ja-to-kr" | "kr-to-ja";
type Phase = "setup" | "playing" | "finished";

type NumberCard = {
  id: string;
  category: NumberCategory;
  categoryLabelJa: string;
  categoryLabelKr: string;
  number: number;
  /** Japanese display: "2026年", "4月", "5,000ウォン" etc. */
  displayJa: string;
  /** Korean digit display: "2026년", "4월", "5,000원" etc. */
  displayKr: string;
  /** Korean reading in hangul: "이천이십육 년", "사 월", "오천 원" etc. */
  readingKr: string;
};

const CATEGORY_OPTIONS: { value: NumberCategory | "all"; labelJa: string; labelKr: string }[] = [
  { value: "all", labelJa: "すべて", labelKr: "전체" },
  { value: "native", labelJa: "固有数詞", labelKr: "고유어" },
  { value: "sino", labelJa: "漢数詞", labelKr: "한자어" },
  { value: "year", labelJa: "年", labelKr: "년" },
  { value: "month", labelJa: "月", labelKr: "월" },
  { value: "day", labelJa: "日", labelKr: "일" },
  { value: "hour", labelJa: "時", labelKr: "시" },
  { value: "minute", labelJa: "分", labelKr: "분" },
  { value: "won", labelJa: "ウォン", labelKr: "원" },
  { value: "age", labelJa: "年齢", labelKr: "살" },
  { value: "item", labelJa: "個", labelKr: "개" },
  { value: "cup", labelJa: "杯", labelKr: "잔" },
];

const COUNT_OPTIONS = [
  { value: 10, label: "10問" },
  { value: 20, label: "20問" },
  { value: 50, label: "50問" },
  { value: 0, label: "全問" },
];

// ── Korean number helpers ─────────────────────────────────────────────────────

/** Sino-Korean reading for a non-negative integer (한자어). */
function sinoKorean(n: number): string {
  if (n === 0) return "영";
  const digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  let result = "";
  let remaining = n;

  if (remaining >= 10000) {
    const man = Math.floor(remaining / 10000);
    result += (man === 1 ? "" : digits[man]) + "만";
    remaining %= 10000;
  }
  if (remaining >= 1000) {
    const cheon = Math.floor(remaining / 1000);
    result += (cheon === 1 ? "" : digits[cheon]) + "천";
    remaining %= 1000;
  }
  if (remaining >= 100) {
    const baek = Math.floor(remaining / 100);
    result += (baek === 1 ? "" : digits[baek]) + "백";
    remaining %= 100;
  }
  if (remaining >= 10) {
    const sip = Math.floor(remaining / 10);
    result += (sip === 1 ? "" : digits[sip]) + "십";
    remaining %= 10;
  }
  if (remaining > 0) {
    result += digits[remaining];
  }
  return result;
}

/**
 * Native Korean reading for hours (고유어).
 * Returns the contracted form used before 시 (e.g., 하나 → 한).
 */
function nativeKoreanHour(n: number): string {
  const hours = [
    "", "한", "두", "세", "네", "다섯",
    "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두",
  ];
  return hours[n] ?? "";
}

/**
 * Native Korean number in the contracted form used immediately before a counter word
 * (살, 개, 잔, etc.).  Handles 1–99.
 * Contraction rules: 하나→한, 둘→두, 셋→세, 넷→네, 스물(20)→스무.
 */
function nativeKoreanCounter(n: number): string {
  if (n <= 0 || n > 99) return "";
  const ones = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
  const tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
  const t = Math.floor(n / 10);
  const o = n % 10;
  // 스물(20) contracts to 스무 only when it stands alone before the counter (n === 20)
  const tensStr = t === 2 && o === 0 ? "스무" : (tens[t] ?? "");
  return tensStr + (ones[o] ?? "");
}

/**
 * Full Korean reading for months.
 * 6월 = 유월, 10월 = 시월 (irregular readings).
 */
function monthReading(m: number): string {
  if (m === 6) return "유월";
  if (m === 10) return "시월";
  return `${sinoKorean(m)} 월`;
}

function formatWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Native Korean reading for counting numbers 1–99 (고유어/固有数詞).
 * Returns the standalone form (하나, 둘, 스물 …).
 */
function nativeKorean(n: number): string {
  if (n <= 0 || n > 99) return "";
  const tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
  const units = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return tens[t];
  if (t === 0) return units[u];
  return tens[t] + units[u];
}

// ── Card pool generation ──────────────────────────────────────────────────────

function generateCards(): NumberCard[] {
  const cards: NumberCard[] = [];

  // Years 2000–2030
  for (let y = 2000; y <= 2030; y++) {
    cards.push({
      id: `year-${y}`,
      category: "year",
      categoryLabelJa: "年",
      categoryLabelKr: "년",
      number: y,
      displayJa: `${y}年`,
      displayKr: `${y}년`,
      readingKr: `${sinoKorean(y)} 년`,
    });
  }

  // Months 1–12
  for (let m = 1; m <= 12; m++) {
    cards.push({
      id: `month-${m}`,
      category: "month",
      categoryLabelJa: "月",
      categoryLabelKr: "월",
      number: m,
      displayJa: `${m}月`,
      displayKr: `${m}월`,
      readingKr: monthReading(m),
    });
  }

  // Days 1–31
  for (let d = 1; d <= 31; d++) {
    cards.push({
      id: `day-${d}`,
      category: "day",
      categoryLabelJa: "日",
      categoryLabelKr: "일",
      number: d,
      displayJa: `${d}日`,
      displayKr: `${d}일`,
      readingKr: `${sinoKorean(d)} 일`,
    });
  }

  // Hours 1–12 (native Korean)
  for (let h = 1; h <= 12; h++) {
    cards.push({
      id: `hour-${h}`,
      category: "hour",
      categoryLabelJa: "時",
      categoryLabelKr: "시",
      number: h,
      displayJa: `${h}時`,
      displayKr: `${h}시`,
      readingKr: `${nativeKoreanHour(h)} 시`,
    });
  }

  // Minutes 0–59
  for (let m = 0; m <= 59; m++) {
    cards.push({
      id: `minute-${m}`,
      category: "minute",
      categoryLabelJa: "分",
      categoryLabelKr: "분",
      number: m,
      displayJa: `${m}分`,
      displayKr: `${m}분`,
      readingKr: `${sinoKorean(m)} 분`,
    });
  }

  // Won — practical amounts covering varied number patterns
  const wonAmounts = [
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500,
    4600, 5000, 5500, 6000, 6700, 7000, 7800, 8000, 9000,
    10000, 12000, 15000, 20000, 25000, 30000, 50000,
  ];
  for (const w of wonAmounts) {
    cards.push({
      id: `won-${w}`,
      category: "won",
      categoryLabelJa: "ウォン",
      categoryLabelKr: "원",
      number: w,
      displayJa: `${formatWithCommas(w)}ウォン`,
      displayKr: `${formatWithCommas(w)}원`,
      readingKr: `${sinoKorean(w)} 원`,
    });
  }

  // Native Korean counting numbers (고유어/固有数詞) — 1–20, tens 30–90
  const nativeNums = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    30, 40, 50, 60, 70, 80, 90,
  ];
  for (const n of nativeNums) {
    const reading = nativeKorean(n);
    cards.push({
      id: `native-${n}`,
      category: "native",
      categoryLabelJa: "固有数詞",
      categoryLabelKr: "고유어",
      number: n,
      displayJa: `${n}`,
      displayKr: reading,
      readingKr: reading,
    });
  }

  // Sino-Korean numbers (한자어/漢数詞) — key values for vocabulary
  const sinoNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000];
  for (const n of sinoNums) {
    const reading = sinoKorean(n);
    cards.push({
      id: `sino-${n}`,
      category: "sino",
      categoryLabelJa: "漢数詞",
      categoryLabelKr: "한자어",
      number: n,
      displayJa: `${n}`,
      displayKr: reading,
      readingKr: reading,
    });
  }

  // Age 1–99 (native Korean + 살)
  for (let a = 1; a <= 99; a++) {
    cards.push({
      id: `age-${a}`,
      category: "age",
      categoryLabelJa: "年齢",
      categoryLabelKr: "살",
      number: a,
      displayJa: `${a}歳`,
      displayKr: `${a}살`,
      readingKr: `${nativeKoreanCounter(a)} 살`,
    });
  }

  // Individual items 1–30 (native Korean + 개)
  for (let i = 1; i <= 30; i++) {
    cards.push({
      id: `item-${i}`,
      category: "item",
      categoryLabelJa: "個",
      categoryLabelKr: "개",
      number: i,
      displayJa: `${i}個`,
      displayKr: `${i}개`,
      readingKr: `${nativeKoreanCounter(i)} 개`,
    });
  }

  // Cups / glasses 1–20 (native Korean + 잔)
  for (let c = 1; c <= 20; c++) {
    cards.push({
      id: `cup-${c}`,
      category: "cup",
      categoryLabelJa: "杯",
      categoryLabelKr: "잔",
      number: c,
      displayJa: `${c}杯`,
      displayKr: `${c}잔`,
      readingKr: `${nativeKoreanCounter(c)} 잔`,
    });
  }

  return cards;
}

const ALL_CARDS = generateCards();

// ── Utilities ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// ── Small components ──────────────────────────────────────────────────────────

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .89 1.02 1.39 1.71.83l9.93-6.86a1 1 0 0 0 0-1.66L9.71 4.31A.998.998 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CategoryBadge({ labelJa, labelKr }: { labelJa: string; labelKr: string }) {
  return (
    <span
      className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] px-2.5 py-0.5 rounded-full"
      style={{
        background: "rgba(99,102,241,0.15)",
        color: "#818cf8",
        border: "1px solid rgba(99,102,241,0.25)",
      }}
    >
      {labelJa}
      <span className="ml-1 text-[#5C6199]">{labelKr}</span>
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NumbersQuizPage() {
  const [mode, setMode] = useState<QuizMode>("ja-to-kr");
  const [categoryFilter, setCategoryFilter] = useState<NumberCategory | "all">("all");
  const [count, setCount] = useState(20);

  const [phase, setPhase] = useState<Phase>("setup");
  const [cards, setCards] = useState<NumberCard[]>([]);
  const [fullRoundDeck, setFullRoundDeck] = useState<NumberCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ card: NumberCard; correct: boolean }[]>([]);
  const [cardAnswers, setCardAnswers] = useState<Record<number, boolean>>({});
  const [cardFlipped, setCardFlipped] = useState<Set<number>>(new Set());

  const startQuiz = useCallback(() => {
    const pool =
      categoryFilter === "all"
        ? ALL_CARDS
        : ALL_CARDS.filter((c) => c.category === categoryFilter);
    const picked = count > 0 ? shuffle(pool).slice(0, count) : shuffle(pool);
    setFullRoundDeck([...picked]);
    setCards(picked);
    setIndex(0);
    setFlipped(false);
    setResults([]);
    setCardAnswers({});
    setCardFlipped(new Set());
    setPhase("playing");
  }, [categoryFilter, count]);

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

  const correctCount = useMemo(() => results.filter((r) => r.correct).length, [results]);

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
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight text-[#F0F0FF]">
              数字クイズ
              <span className="ml-2 text-sm font-semibold text-[#9499C4]">숫자 퀴즈</span>
            </h1>
          </div>

          <Card className="space-y-5 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] pb-4">
              <h2 className="text-sm font-semibold text-[#F0F0FF]">
                設定 <span className="ml-1.5 text-xs font-medium text-[#9499C4]">설정</span>
              </h2>
            </div>

            {/* 出題モード */}
            <div>
              <div className="text-sm font-semibold text-[#BCC0E8]">
                出題モード <span className="ml-1 text-[#5C6199]">출제 방향</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Chip
                  type="button"
                  selected={mode === "ja-to-kr"}
                  onClick={() => setMode("ja-to-kr")}
                >
                  🇯🇵 → 🇰🇷
                </Chip>
                <Chip
                  type="button"
                  selected={mode === "kr-to-ja"}
                  onClick={() => setMode("kr-to-ja")}
                >
                  🇰🇷 → 🇯🇵
                </Chip>
              </div>
              <p className="mt-1.5 text-xs text-[#5C6199]">
                {mode === "ja-to-kr"
                  ? "日本語の数字表記を見て、韓国語の読み方を答える"
                  : "韓国語の数字表記を見て、日本語の読み方を答える"}
              </p>
            </div>

            {/* カテゴリ */}
            <div>
              <div className="text-sm font-semibold text-[#BCC0E8]">
                カテゴリ <span className="ml-1 text-[#5C6199]">카테고리</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    type="button"
                    selected={categoryFilter === o.value}
                    onClick={() => setCategoryFilter(o.value as NumberCategory | "all")}
                  >
                    {o.labelJa}
                    <span className="ml-1 text-xs opacity-70">{o.labelKr}</span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* 問題数 */}
            <div>
              <div className="text-sm font-semibold text-[#BCC0E8]">
                問題数 <span className="ml-1 text-[#5C6199]">문제 수</span>
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

            <Button className="w-full" type="button" onClick={startQuiz}>
              スタート 시작
            </Button>
          </Card>
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

    // In ja-to-kr: question is Japanese, answer is Korean reading
    // In kr-to-ja: question is Korean reading (ハングル), answer is Japanese
    const question = mode === "ja-to-kr" ? card.displayJa : card.readingKr;
    const answerPrimary = mode === "ja-to-kr" ? card.readingKr : card.displayJa;
    // Secondary always shows Korean digit form and reading
    const answerReading = card.readingKr;
    const answerDigit = card.displayKr;

    return (
      <div className="relative flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-[#08091A] px-4 py-4 sm:py-8 text-[#F0F0FF]">
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
          style={{ width: 400, height: 300, top: -80, left: "30%", transform: "translateX(-50%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 sm:gap-5">
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
              <span className="font-mono text-xs text-[#5C6199]">
                {index + 1} / {cards.length}
              </span>
              <CategoryBadge labelJa={card.categoryLabelJa} labelKr={card.categoryLabelKr} />
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
          <div className="flex-1 min-h-0 [perspective:1100px]">
            <button
              type="button"
              onClick={() => {
                if (!flipped) {
                  setFlipped(true);
                  setCardFlipped((prev) => new Set([...prev, index]));
                } else {
                  setFlipped(false);
                  setCardFlipped((prev) => {
                    const next = new Set(prev);
                    next.delete(index);
                    return next;
                  });
                }
              }}
              aria-pressed={flipped}
              aria-label={flipped ? "カードを表に戻して問題を表示" : "カードをめくって答えを表示"}
              className={[
                "group relative block h-full w-full rounded-2xl p-0 text-left",
                "outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08091A]",
                "cursor-pointer",
              ].join(" ")}
            >
              <div
                key={card.id}
                className="relative h-full w-full [transform-style:preserve-3d] will-change-transform"
                style={{
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* 表面（問題） */}
                <div
                  className={[
                    "absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-4 sm:gap-4 sm:py-8 text-center",
                    "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                    "backdrop-blur-xl [backface-visibility:hidden] [transform:translateZ(0.1px)]",
                  ].join(" ")}
                >
                  <div className="text-xs font-semibold tracking-wide text-[#5C6199]">
                    {card.categoryLabelJa}
                    <span className="ml-1 text-[#3a3d5a]">{card.categoryLabelKr}</span>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-[#F0F0FF] sm:text-5xl">
                    {question}
                  </div>
                  {/* 音声ボタン — 韓国語表示のとき (kr-to-ja) のみ表面に表示 */}
                  {mode === "kr-to-ja" ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => speakKorean(card.readingKr)}
                        aria-label="韓国語の発音を再生"
                        title="韓国語の発音を再生"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/25"
                      >
                        <PlayGlyph className="h-[1.1rem] w-[1.1rem] shrink-0" />
                        <span className="text-xs">再生</span>
                      </button>
                    </div>
                  ) : null}
                  <div className="text-sm text-[#5C6199]">
                    タップでめくる
                    <span className="mt-1 block text-xs text-[#5C6199]">탭하여 뒤집기</span>
                  </div>
                </div>

                {/* 裏面（答え） */}
                <div
                  className={[
                    "absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-y-auto rounded-2xl px-4 py-4 sm:gap-3 sm:py-8 text-center",
                    "border border-[rgba(99,102,241,0.25)] backdrop-blur-xl",
                    "[backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]",
                    "shadow-[0_0_24px_rgba(99,102,241,0.2),0_8px_32px_rgba(0,0,0,0.4)]",
                  ].join(" ")}
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))" }}
                >
                  <div className="text-xs font-semibold text-[#9499C4]">
                    {card.categoryLabelJa}
                    <span className="ml-1 text-[#5C6199]">{card.categoryLabelKr}</span>
                  </div>
                  <div className="text-xl font-bold text-[#BCC0E8]">{question}</div>
                  {/* Primary answer */}
                  <div className="text-3xl font-extrabold text-[#F0F0FF] sm:text-4xl">
                    {answerPrimary}
                  </div>
                  {/* 音声ボタン — 韓国語表示のとき (ja-to-kr) のみ裏面に表示 */}
                  {mode === "ja-to-kr" ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => speakKorean(card.readingKr)}
                        aria-label="韓国語の発音を再生"
                        title="韓国語の発音を再生"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/25"
                      >
                        <PlayGlyph className="h-[1.1rem] w-[1.1rem] shrink-0" />
                        <span className="text-xs">再生</span>
                      </button>
                    </div>
                  ) : null}
                  {/* Secondary info: always show both Korean reading and digit form */}
                  <div className="mt-1 space-y-1 text-sm">
                    {mode === "ja-to-kr" ? (
                      /* ja-to-kr: answerPrimary is readingKr, show digit form as ref */
                      <div className="text-[#9499C4]">
                        <span className="text-[#5C6199]">표기 </span>
                        {answerDigit}
                      </div>
                    ) : (
                      /* kr-to-ja: question was readingKr, show digit form as ref */
                      <div className="text-[#9499C4]">
                        <span className="text-[#5C6199]">표기 </span>
                        {answerDigit}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-[#5C6199]">
                    タップで問題に戻る
                    <span className="mt-0.5 block text-[#5C6199]">탭하여 앞으로 돌아가기</span>
                  </div>
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
            style={{
              background: "linear-gradient(135deg,#6366f1,#3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
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

        {/* 間違えた問題一覧 */}
        {wrongCards.length > 0 ? (
          <div className="space-y-3">
            <h2 className="px-1 text-sm font-semibold text-[#F0F0FF]">
              わからなかった問題{" "}
              <span className="ml-1.5 text-xs font-medium text-[#9499C4]">모르겠던 문제</span>
            </h2>
            <div className="space-y-2">
              {wrongCards.map(({ card }) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CategoryBadge
                          labelJa={card.categoryLabelJa}
                          labelKr={card.categoryLabelKr}
                        />
                      </div>
                      <div className="mt-1 font-bold text-[#F0F0FF]">{card.displayJa}</div>
                      <div className="text-sm font-semibold text-[#818cf8]">{card.readingKr}</div>
                      <div className="text-xs text-[#9499C4]">{card.displayKr}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakKorean(card.readingKr)}
                      aria-label="韓国語の発音を再生"
                      className="shrink-0 inline-flex items-center justify-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    >
                      <PlayGlyph className="h-3.5 w-3.5" />
                      再生
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.1)] p-4 text-center text-sm font-semibold text-[#34d399] backdrop-blur-xl">
            🎉 すべて「わかった」です！완벽해요!
          </div>
        )}
      </div>
    </div>
  );
}
