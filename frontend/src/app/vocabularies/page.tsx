"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { VocabularyListVirtualGrid } from "@/components/vocabulary/VocabularyListVirtualGrid";
import { ApiError } from "@/lib/api/http";
import { listVocabularies, type UserVocabulary } from "@/lib/api/vocabularies";

type Filters = {
  level: string;
  entry_type: string;
  pos: string;
  q: string;
};

const POS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "noun", label: "名詞" },
  { value: "verb", label: "動詞" },
  { value: "adj", label: "形容詞" },
  { value: "adv", label: "副詞" },
  { value: "particle", label: "助詞" },
  { value: "determiner", label: "冠形詞" },
  { value: "pronoun", label: "代名詞" },
  { value: "interjection", label: "感動詞" },
  { value: "other", label: "その他" },
];

const ENTRY_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "word", label: "単語" },
  { value: "phrase", label: "熟語" },
  { value: "idiom", label: "慣用句" },
];

const LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}級` })),
];

/** Build the /vocabularies URL with filter search params. */
function buildVocabulariesUrl(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.level) params.set("level", filters.level);
  if (filters.entry_type) params.set("entry_type", filters.entry_type);
  if (filters.pos) params.set("pos", filters.pos);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return qs ? `/vocabularies?${qs}` : "/vocabularies";
}

export default function VocabulariesPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10"
        >
          <div className="text-sm text-[#9499C4]">読み込み中...</div>
        </div>
      }
    >
      <VocabulariesPageInner />
    </Suspense>
  );
}

// Inner component separated from the default export so that useSearchParams()
// (which requires a Suspense boundary) can be used in a client component.
function VocabulariesPageInner() {
  const { state, refreshMe } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive chip/select filters directly from URL so they stay in sync with
  // browser back/forward navigation.
  const filters: Filters = useMemo(
    () => ({
      level: searchParams.get("level") ?? "",
      entry_type: searchParams.get("entry_type") ?? "",
      pos: searchParams.get("pos") ?? "",
      q: searchParams.get("q") ?? "",
    }),
    [searchParams],
  );

  // Keep a separate local state for the keyword input so typing is responsive.
  // The URL (and therefore filters.q) is updated after a short debounce.
  const [qInput, setQInput] = useState(filters.q);

  // Sync the input field when the URL changes externally (e.g. browser back).
  useEffect(() => {
    setQInput(filters.q);
  }, [filters.q]);

  const [items, setItems] = useState<UserVocabulary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep a ref to always have the latest filters inside async callbacks
  // without making them part of every effect's dependency array.
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  // Helper: build new URL search params from the current params and a partial update.
  const replaceParams = useCallback(
    (updates: Partial<Filters>) => {
      router.replace(buildVocabulariesUrl({ ...filtersRef.current, ...updates }));
    },
    [router],
  );

  // Debounce the keyword: update URL 300 ms after the user stops typing.
  // Depends only on qInput (and the stable router ref) so that clicking a
  // chip filter does not reset an in-progress keyword debounce.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qInput === filtersRef.current.q) return;
      router.replace(buildVocabulariesUrl({ ...filtersRef.current, q: qInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [qInput, router]);

  const query = useMemo(() => {
    const level = filters.level ? Number(filters.level) : undefined;
    return {
      level: Number.isFinite(level) ? level : undefined,
      entry_type: filters.entry_type || undefined,
      pos: filters.pos || undefined,
      compact: true,
      q: filters.q.trim() || undefined,
    };
  }, [filters]);

  useEffect(() => {
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = state.status === "authed" ? state.token : null;
        const res = await listVocabularies(token, query);
        setItems(res.vocabularies);
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [query, state]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10">
        <div className="text-sm text-[#9499C4]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.10)]"
        style={{ width: 600, height: 400, top: -100, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-5xl space-y-6">
        <Section
          title="絞り込み"
          subtitle="필터"
          description="タップで絞り込み。もう一度タップで解除できます。"
          headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
          titleClassName="text-[#F0F0FF]"
          descriptionClassName="text-[#9499C4]"
          right={
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setQInput("");
                replaceParams({ level: "", entry_type: "", pos: "", q: "" });
              }}
            >
              リセット
            </Button>
          }
        >
          <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <div className="space-y-4">
              <div>
                <Input
                  label="キーワード"
                  labelSuffix="검색어"
                  tone="dark"
                  type="search"
                  placeholder="例: 안녕하세요 / こんにちは"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-[#F0F0FF]">
                  TOPIK <span className="ml-1 font-semibold text-[#9499C4]">토픽</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={filters.level === o.value}
                      onClick={() =>
                        replaceParams({ level: filters.level === o.value ? "" : o.value })
                      }
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#F0F0FF]">
                  種別 <span className="ml-1 font-semibold text-[#9499C4]">유형</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ENTRY_TYPE_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={filters.entry_type === o.value}
                      onClick={() =>
                        replaceParams({
                          entry_type: filters.entry_type === o.value ? "" : o.value,
                        })
                      }
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#F0F0FF]">
                  品詞 <span className="ml-1 font-semibold text-[#9499C4]">품사</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {POS_OPTIONS.map((o) => (
                    <Chip
                      key={o.value}
                      type="button"
                      selected={filters.pos === o.value}
                      onClick={() =>
                        replaceParams({ pos: filters.pos === o.value ? "" : o.value })
                      }
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Section>

        <Section
          title="語彙一覧"
          subtitle="단어 목록"
          description={loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
          right={error ? <div className="text-sm font-medium text-[#fb7185]">{error}</div> : null}
          headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
          titleClassName="text-[#F0F0FF]"
          descriptionClassName="text-[#9499C4]"
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-5/6" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-7 w-16 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <VocabularyListVirtualGrid items={items} />
          ) : null}

          {!loading && items && items.length === 0 ? (
            <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-center text-[#F0F0FF] backdrop-blur-xl">
              <div className="text-sm font-semibold text-[#F0F0FF]">該当する語彙がありません</div>
              <div className="mt-1 text-sm text-[#9499C4]">絞り込みをリセットしてみてください。</div>
            </Card>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
