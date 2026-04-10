"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
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
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-violet-700 via-fuchsia-600 to-orange-500 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">語彙</h1>
          <p className="text-sm text-white/80">公開中の語彙のみ表示します。</p>
        </div>

        <Section
          title="絞り込み"
          description="タップで絞り込み。もう一度タップで解除できます。"
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
                <div className="text-sm font-semibold text-white">TOPIK</div>
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
                <div className="text-sm font-semibold text-white">種別</div>
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
                <div className="text-sm font-semibold text-white">品詞</div>
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
          description={loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
          right={error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="border-white/10 bg-white/10 p-5 text-white backdrop-blur">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-5/6" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-7 w-16 rounded-full" />
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                  </Card>
                ))
              : (items ?? []).map((v, idx) => (
                  <Link key={v.id} href={`/vocabularies/${v.id}`} className="group">
                    <Card
                      className={[
                        "p-5 transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md",
                        "bg-gradient-to-br",
                        idx % 3 === 0 ? "from-violet-700/60 via-fuchsia-600/40 to-orange-500/50" : "",
                        idx % 3 === 1 ? "from-sky-500/60 via-emerald-500/40 to-lime-400/40" : "",
                        idx % 3 === 2 ? "from-orange-500/70 via-rose-500/40 to-violet-700/50" : "",
                        "border-white/10 text-white backdrop-blur",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-lg font-extrabold text-white">{v.term}</div>
                          <div className="mt-1 line-clamp-2 text-sm text-white/85">
                            {v.meaning_ja}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-xs text-white/80">
                          <div className="font-semibold">{v.level_label_ja}</div>
                          <div className="mt-1">{v.pos_label_ja}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
                          {v.entry_type_label_ja}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
                          {v.pos_label_ja}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
          </div>

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

