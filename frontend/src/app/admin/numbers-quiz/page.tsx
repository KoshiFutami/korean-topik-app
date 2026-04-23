"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { logoutAdmin, meAdmin } from "@/lib/api/admin/auth";

const ADMIN_TOKEN_KEY = "topik.admin.token";

// ── Korean number helpers (同じロジックを管理画面でも使用) ──────────────────

type NumberCategory = "year" | "month" | "day" | "hour" | "minute" | "won" | "native" | "sino" | "age" | "item" | "cup";

type NumberCard = {
  id: string;
  category: NumberCategory;
  categoryLabelJa: string;
  categoryLabelKr: string;
  number: number;
  displayJa: string;
  displayKr: string;
  readingKr: string;
};

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
  if (remaining > 0) result += digits[remaining];
  return result;
}

function nativeKoreanHour(n: number): string {
  const hours = [
    "", "한", "두", "세", "네", "다섯",
    "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두",
  ];
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

function formatWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function generateCards(): NumberCard[] {
  const cards: NumberCard[] = [];

  for (let y = 2000; y <= 2030; y++) {
    cards.push({ id: `year-${y}`, category: "year", categoryLabelJa: "年", categoryLabelKr: "년", number: y, displayJa: `${y}年`, displayKr: `${y}년`, readingKr: `${sinoKorean(y)} 년` });
  }
  for (let m = 1; m <= 12; m++) {
    cards.push({ id: `month-${m}`, category: "month", categoryLabelJa: "月", categoryLabelKr: "월", number: m, displayJa: `${m}月`, displayKr: `${m}월`, readingKr: monthReading(m) });
  }
  for (let d = 1; d <= 31; d++) {
    cards.push({ id: `day-${d}`, category: "day", categoryLabelJa: "日", categoryLabelKr: "일", number: d, displayJa: `${d}日`, displayKr: `${d}일`, readingKr: `${sinoKorean(d)} 일` });
  }
  for (let h = 1; h <= 12; h++) {
    cards.push({ id: `hour-${h}`, category: "hour", categoryLabelJa: "時", categoryLabelKr: "시", number: h, displayJa: `${h}時`, displayKr: `${h}시`, readingKr: `${nativeKoreanHour(h)} 시` });
  }
  for (let m = 0; m <= 59; m++) {
    cards.push({ id: `minute-${m}`, category: "minute", categoryLabelJa: "分", categoryLabelKr: "분", number: m, displayJa: `${m}分`, displayKr: `${m}분`, readingKr: `${sinoKorean(m)} 분` });
  }
  const wonAmounts = [
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500,
    4600, 5000, 5500, 6000, 6700, 7000, 7800, 8000, 9000,
    10000, 12000, 15000, 20000, 25000, 30000, 50000,
  ];
  for (const w of wonAmounts) {
    cards.push({ id: `won-${w}`, category: "won", categoryLabelJa: "ウォン", categoryLabelKr: "원", number: w, displayJa: `${formatWithCommas(w)}ウォン`, displayKr: `${formatWithCommas(w)}원`, readingKr: `${sinoKorean(w)} 원` });
  }
  const nativeNums = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    30, 40, 50, 60, 70, 80, 90,
  ];
  for (const n of nativeNums) {
    const reading = nativeKorean(n);
    cards.push({ id: `native-${n}`, category: "native", categoryLabelJa: "固有数詞", categoryLabelKr: "고유어", number: n, displayJa: `${n}`, displayKr: reading, readingKr: reading });
  }
  const sinoNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000];
  for (const n of sinoNums) {
    const reading = sinoKorean(n);
    cards.push({ id: `sino-${n}`, category: "sino", categoryLabelJa: "漢数詞", categoryLabelKr: "한자어", number: n, displayJa: `${n}`, displayKr: reading, readingKr: reading });
  }
  for (let a = 1; a <= 99; a++) {
    cards.push({ id: `age-${a}`, category: "age", categoryLabelJa: "年齢", categoryLabelKr: "살", number: a, displayJa: `${a}歳`, displayKr: `${a}살`, readingKr: `${nativeKoreanCounter(a)} 살` });
  }
  for (let i = 1; i <= 30; i++) {
    cards.push({ id: `item-${i}`, category: "item", categoryLabelJa: "個", categoryLabelKr: "개", number: i, displayJa: `${i}個`, displayKr: `${i}개`, readingKr: `${nativeKoreanCounter(i)} 개` });
  }
  for (let c = 1; c <= 20; c++) {
    cards.push({ id: `cup-${c}`, category: "cup", categoryLabelJa: "杯", categoryLabelKr: "잔", number: c, displayJa: `${c}杯`, displayKr: `${c}잔`, readingKr: `${nativeKoreanCounter(c)} 잔` });
  }
  return cards;
}

const ALL_CARDS = generateCards();

const CATEGORY_OPTIONS: { value: NumberCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "native", label: "固有数詞 (고유어)" },
  { value: "sino", label: "漢数詞 (한자어)" },
  { value: "year", label: "年 (년)" },
  { value: "month", label: "月 (월)" },
  { value: "day", label: "日 (일)" },
  { value: "hour", label: "時 (시)" },
  { value: "minute", label: "分 (분)" },
  { value: "won", label: "ウォン (원)" },
  { value: "age", label: "年齢 (살)" },
  { value: "item", label: "個 (개)" },
  { value: "cup", label: "杯 (잔)" },
];

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

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
        selected
          ? "bg-zinc-900 text-white ring-zinc-900"
          : "bg-white text-zinc-700 ring-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminNumbersQuizPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<NumberCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent("/admin/numbers-quiz")}`);
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const meRes = await meAdmin(token);
        setAdminName(meRes.admin.name);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.replace(`/admin/login?next=${encodeURIComponent("/admin/numbers-quiz")}`);
        }
      }
    };
    run().catch(() => undefined);
  }, [router, token]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (q) {
        const match =
          c.displayJa.toLowerCase().includes(q) ||
          c.displayKr.toLowerCase().includes(q) ||
          c.readingKr.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of ALL_CARDS) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-5xl space-y-4">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">管理: 数字クイズ</h1>
              <p className="mt-1 text-sm text-zinc-600">
                {adminName ? `ログイン中: ${adminName}` : "管理者としてログイン中"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/admin/vocabularies"
              >
                語彙管理へ
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/admin/questions"
              >
                問題管理へ
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/numbers-quiz"
              >
                学習者画面へ
              </Link>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  if (!token) return;
                  setLoading(true);
                  logoutAdmin(token)
                    .catch(() => undefined)
                    .finally(() => {
                      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
                      router.push("/admin/login");
                    });
                }}
              >
                ログアウト
              </Button>
            </div>
          </div>
        </Card>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(["native", "sino", "year", "month", "day", "hour", "minute", "won", "age", "item", "cup"] as NumberCategory[]).map((cat) => {
            const labels: Record<NumberCategory, { ja: string; kr: string }> = {
              native: { ja: "固有数詞", kr: "고유어" },
              sino: { ja: "漢数詞", kr: "한자어" },
              year: { ja: "年", kr: "년" },
              month: { ja: "月", kr: "월" },
              day: { ja: "日", kr: "일" },
              hour: { ja: "時", kr: "시" },
              minute: { ja: "分", kr: "분" },
              won: { ja: "ウォン", kr: "원" },
              age: { ja: "年齢", kr: "살" },
              item: { ja: "個", kr: "개" },
              cup: { ja: "杯", kr: "잔" },
            };
            return (
              <div
                key={cat}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-zinc-900">{categoryCounts[cat] ?? 0}</div>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  {labels[cat].ja}
                  <span className="ml-1 text-xs text-zinc-400">{labels[cat].kr}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* フィルタ */}
        <Card>
          <div className="space-y-4">
            <div className="text-sm font-semibold text-zinc-700">絞り込み</div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="admin-nq-search">
                キーワード
              </label>
              <input
                id="admin-nq-search"
                type="search"
                placeholder="例: 2026年 / 이천이십육 년"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-zinc-700">カテゴリ</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={categoryFilter === o.value}
                    onClick={() => setCategoryFilter(o.value as NumberCategory | "all")}
                  >
                    {o.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* カード一覧 */}
        <Card>
          <div className="mb-4 text-sm text-zinc-600">
            {loading
              ? "読み込み中..."
              : `件数: ${filteredCards.length} / ${ALL_CARDS.length}`}
          </div>

          <div className="divide-y divide-zinc-200">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-4 py-3 -mx-6 px-6 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
                      {card.categoryLabelJa}
                      <span className="ml-0.5 text-zinc-400">{card.categoryLabelKr}</span>
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-zinc-900">{card.displayJa}</div>
                  <div className="text-sm font-medium text-violet-700">{card.readingKr}</div>
                  <div className="text-xs text-zinc-500">{card.displayKr}</div>
                </div>
                <button
                  type="button"
                  onClick={() => speakKorean(card.readingKr)}
                  aria-label="韓国語の発音を再生"
                  title="韓国語の発音を再生"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  <PlayGlyph className="h-3.5 w-3.5" />
                  再生
                </button>
              </div>
            ))}

            {filteredCards.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-600">
                条件に一致するカードがありません。
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
