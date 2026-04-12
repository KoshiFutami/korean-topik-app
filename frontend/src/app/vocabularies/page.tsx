"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { VocabularyListVirtualGrid } from "@/components/vocabulary/VocabularyListVirtualGrid";
import { ApiError } from "@/lib/api/http";
import { listVocabularies, type UserVocabulary } from "@/lib/api/vocabularies";

type Filters = {
  level: string;
  entry_type: string;
  pos: string;
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
  const { state, refreshMe } = useAuth();
  const [filters, setFilters] = useState<Filters>({ level: "", entry_type: "", pos: "" });
  const [items, setItems] = useState<UserVocabulary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const level = filters.level ? Number(filters.level) : undefined;
    return {
      level: Number.isFinite(level) ? level : undefined,
      entry_type: filters.entry_type || undefined,
      pos: filters.pos || undefined,
      compact: true,
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
              onClick={() => setFilters({ level: "", entry_type: "", pos: "" })}
            >
              リセット
            </Button>
          }
        >
          <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
            <div className="space-y-4">
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
                        setFilters((p) => ({ ...p, level: p.level === o.value ? "" : o.value }))
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
                        setFilters((p) => ({
                          ...p,
                          entry_type: p.entry_type === o.value ? "" : o.value,
                        }))
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
                        setFilters((p) => ({ ...p, pos: p.pos === o.value ? "" : o.value }))
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

