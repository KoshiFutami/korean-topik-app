"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
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

export default function VocabulariesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
          <div className="text-sm text-zinc-600">読み込み中...</div>
        </div>
      }
    >
      <VocabulariesPageInner />
    </Suspense>
  );
}

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

  // Helper: build new URL search params from the current params and a partial update.
  const replaceParams = useCallback(
    (updates: Partial<Filters>) => {
      const params = new URLSearchParams();
      const next = { ...filters, ...updates };
      if (next.level) params.set("level", next.level);
      if (next.entry_type) params.set("entry_type", next.entry_type);
      if (next.pos) params.set("pos", next.pos);
      if (next.q) params.set("q", next.q);
      const qs = params.toString();
      router.replace(qs ? `/vocabularies?${qs}` : "/vocabularies");
    },
    [filters, router],
  );

  // Debounce the keyword: update URL 300 ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qInput !== filters.q) {
        replaceParams({ q: qInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [qInput, filters.q, replaceParams]);

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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="text-sm text-zinc-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            語彙
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">단어</span>
          </h1>
          <p className="text-sm text-white/80">
            目的の語を、レベルや品詞からさっと探して意味や例文を確認できます。
          </p>
        </div>

        <Section
          title="絞り込み"
          subtitle="필터"
          description="タップで絞り込み。もう一度タップで解除できます。"
          headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
          titleClassName="text-white drop-shadow-sm"
          descriptionClassName="text-white/80"
          right={
            <Button
              variant="secondary"
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
          <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
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
                <div className="text-sm font-semibold text-white">
                  TOPIK <span className="ml-1 font-semibold text-white/80">토픽</span>
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
                <div className="text-sm font-semibold text-white">
                  種別 <span className="ml-1 font-semibold text-white/80">유형</span>
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
                <div className="text-sm font-semibold text-white">
                  品詞 <span className="ml-1 font-semibold text-white/80">품사</span>
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
          right={error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}
          headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
          titleClassName="text-white drop-shadow-sm"
          descriptionClassName="text-white/80"
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="border-white/10 bg-white/10 p-5 text-white backdrop-blur">
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
            <Card className="border-white/10 bg-white/10 text-center text-white backdrop-blur">
              <div className="text-sm font-semibold text-white">該当する語彙がありません</div>
              <div className="mt-1 text-sm text-white/80">絞り込みをリセットしてみてください。</div>
            </Card>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
