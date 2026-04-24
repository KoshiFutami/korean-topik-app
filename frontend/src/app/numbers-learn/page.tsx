"use client";

import Link from "next/link";
import { useState } from "react";

import { Chip } from "@/components/ui/Chip";

type NumberCategory = "native" | "sino" | "year" | "month" | "day" | "hour" | "minute" | "won" | "age" | "item" | "cup";

type NumberRow = {
  id: string;
  category: NumberCategory;
  displayJa: string;
  displayKr: string;
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

const CATEGORY_LABELS: Record<NumberCategory, { ja: string; kr: string; desc: string }> = {
  native: { ja: "固有数詞", kr: "고유어", desc: "個数・年齢・時間(時)などに使う韓国固有の数え方" },
  sino: { ja: "漢数詞", kr: "한자어", desc: "年月日・分・お金などに使う漢字由来の数え方" },
  year: { ja: "年", kr: "년", desc: "漢数詞 + 년" },
  month: { ja: "月", kr: "월", desc: "漢数詞 + 월（6월=유월、10월=시월は不規則）" },
  day: { ja: "日", kr: "일", desc: "漢数詞 + 일" },
  hour: { ja: "時", kr: "시", desc: "固有数詞 + 시（1〜12時）" },
  minute: { ja: "分", kr: "분", desc: "漢数詞 + 분" },
  won: { ja: "ウォン", kr: "원", desc: "漢数詞 + 원" },
  age: { ja: "年齢", kr: "살", desc: "固有数詞(縮約形) + 살" },
  item: { ja: "個", kr: "개", desc: "固有数詞(縮約形) + 개" },
  cup: { ja: "杯", kr: "잔", desc: "固有数詞(縮約形) + 잔" },
};

// ── Korean number helpers ─────────────────────────────────────────────────────

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

function nativeKoreanHour(n: number): string {
  const hours = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두"];
  return hours[n] ?? "";
}

function nativeKoreanCounter(n: number): string {
  if (n <= 0 || n > 99) return "";
  const ones = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
  const tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
  const t = Math.floor(n / 10);
  const o = n % 10;
  const tensStr = t === 2 && o === 0 ? "스무" : (tens[t] ?? "");
  return tensStr + (ones[o] ?? "");
}

function monthReading(m: number): string {
  if (m === 6) return "유월";
  if (m === 10) return "시월";
  return `${sinoKorean(m)} 월`;
}

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

function formatWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── Row data generation ───────────────────────────────────────────────────────

function generateRows(): NumberRow[] {
  const rows: NumberRow[] = [];

  // Native Korean counting numbers (고유어/固有数詞) — 1–20, tens 30–90
  const nativeNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 40, 50, 60, 70, 80, 90];
  for (const n of nativeNums) {
    const reading = nativeKorean(n);
    rows.push({ id: `native-${n}`, category: "native", displayJa: `${n}`, displayKr: reading, readingKr: reading });
  }

  // Sino-Korean numbers (한자어/漢数詞)
  const sinoNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000];
  for (const n of sinoNums) {
    const reading = sinoKorean(n);
    rows.push({ id: `sino-${n}`, category: "sino", displayJa: `${n}`, displayKr: reading, readingKr: reading });
  }

  // Years 2000–2030
  for (let y = 2000; y <= 2030; y++) {
    rows.push({ id: `year-${y}`, category: "year", displayJa: `${y}年`, displayKr: `${y}년`, readingKr: `${sinoKorean(y)} 년` });
  }

  // Months 1–12
  for (let m = 1; m <= 12; m++) {
    rows.push({ id: `month-${m}`, category: "month", displayJa: `${m}月`, displayKr: `${m}월`, readingKr: monthReading(m) });
  }

  // Days 1–31
  for (let d = 1; d <= 31; d++) {
    rows.push({ id: `day-${d}`, category: "day", displayJa: `${d}日`, displayKr: `${d}일`, readingKr: `${sinoKorean(d)} 일` });
  }

  // Hours 1–12 (native Korean)
  for (let h = 1; h <= 12; h++) {
    rows.push({ id: `hour-${h}`, category: "hour", displayJa: `${h}時`, displayKr: `${h}시`, readingKr: `${nativeKoreanHour(h)} 시` });
  }

  // Minutes 0–59
  for (let m = 0; m <= 59; m++) {
    rows.push({ id: `minute-${m}`, category: "minute", displayJa: `${m}分`, displayKr: `${m}분`, readingKr: `${sinoKorean(m)} 분` });
  }

  // Won amounts
  const wonAmounts = [
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500,
    4600, 5000, 5500, 6000, 6700, 7000, 7800, 8000, 9000,
    10000, 12000, 15000, 20000, 25000, 30000, 50000,
  ];
  for (const w of wonAmounts) {
    rows.push({
      id: `won-${w}`,
      category: "won",
      displayJa: `${formatWithCommas(w)}ウォン`,
      displayKr: `${formatWithCommas(w)}원`,
      readingKr: `${sinoKorean(w)} 원`,
    });
  }

  // Age 1–99
  for (let a = 1; a <= 99; a++) {
    rows.push({ id: `age-${a}`, category: "age", displayJa: `${a}歳`, displayKr: `${a}살`, readingKr: `${nativeKoreanCounter(a)} 살` });
  }

  // Items 1–30
  for (let i = 1; i <= 30; i++) {
    rows.push({ id: `item-${i}`, category: "item", displayJa: `${i}個`, displayKr: `${i}개`, readingKr: `${nativeKoreanCounter(i)} 개` });
  }

  // Cups 1–20
  for (let c = 1; c <= 20; c++) {
    rows.push({ id: `cup-${c}`, category: "cup", displayJa: `${c}杯`, displayKr: `${c}잔`, readingKr: `${nativeKoreanCounter(c)} 잔` });
  }

  return rows;
}

const ALL_ROWS = generateRows();

// ── Speech helpers ────────────────────────────────────────────────────────────

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

// ── Components ────────────────────────────────────────────────────────────────

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .89 1.02 1.39 1.71.83l9.93-6.86a1 1 0 0 0 0-1.66L9.71 4.31A.998.998 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CategorySection({ category, rows }: { category: NumberCategory; rows: NumberRow[] }) {
  const label = CATEGORY_LABELS[category];
  return (
    <section aria-labelledby={`section-${category}`}>
      <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <h2 id={`section-${category}`} className="text-base font-bold text-[#F0F0FF]">
          {label.ja}
          <span className="ml-2 text-sm font-semibold text-[#818cf8]">{label.kr}</span>
        </h2>
        <span className="text-xs text-[#5C6199]">{label.desc}</span>
      </div>
      <div className="overflow-x-auto overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5C6199]">
                数字（日本語）
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5C6199]">
                韓国語表記
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5C6199]">
                読み方（ハングル）
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#5C6199]">
                音声
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={[
                  "transition-colors hover:bg-[rgba(99,102,241,0.06)]",
                  i < rows.length - 1 ? "border-b border-[rgba(255,255,255,0.04)]" : "",
                ].join(" ")}
              >
                <td className="px-4 py-2.5 font-medium text-[#BCC0E8]">{row.displayJa}</td>
                <td className="px-4 py-2.5 font-semibold text-[#F0F0FF]">{row.displayKr}</td>
                <td className="px-4 py-2.5 font-bold text-[#818cf8]">{row.readingKr}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => speakKorean(row.readingKr)}
                    disabled={!isSpeechSupported()}
                    aria-label={`${row.displayJa}の韓国語発音を再生`}
                    title="発音を再生"
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 text-xs font-medium text-[#BCC0E8] transition-colors hover:bg-[rgba(99,102,241,0.15)] hover:text-[#F0F0FF] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PlayGlyph className="h-3 w-3 shrink-0" />
                    再生
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NumbersLearnPage() {
  const [categoryFilter, setCategoryFilter] = useState<NumberCategory | "all">("all");

  const categories = (
    categoryFilter === "all"
      ? (Object.keys(CATEGORY_LABELS) as NumberCategory[])
      : [categoryFilter]
  );

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
        style={{ width: 600, height: 400, top: -100, left: "50%", transform: "translateX(-50%)" }}
      />

      <div className="relative mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F0F0FF]">
              数字の学習
              <span className="ml-3 text-base font-semibold text-[#9499C4]">숫자 학습</span>
            </h1>
            <p className="mt-1 text-sm text-[#BCC0E8]">
              韓国語の数字を一覧で確認。▶ ボタンで発音を聞けます。
            </p>
          </div>
          <Link
            href="/numbers-quiz"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.08)] px-4 py-2 text-sm font-semibold text-[#818cf8] transition-colors hover:bg-[rgba(99,102,241,0.15)] hover:text-[#F0F0FF]"
          >
            <span aria-hidden>🔢</span>
            数字クイズへ
          </Link>
        </div>

        {/* Category filter */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5C6199]">
            カテゴリで絞り込む
          </div>
          <div className="flex flex-wrap gap-2">
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

        {/* Number tables */}
        <div className="space-y-8">
          {categories.map((cat) => {
            const rows = ALL_ROWS.filter((r) => r.category === cat);
            return <CategorySection key={cat} category={cat} rows={rows} />;
          })}
        </div>
      </div>
    </div>
  );
}
