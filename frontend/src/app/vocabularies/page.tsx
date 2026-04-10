"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    if (state.status === "guest") return;
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    const run = async () => {
      if (state.status !== "authed") return;
      setLoading(true);
      setError(null);
      try {
        const res = await listVocabularies(state.token, query);
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

  if (state.status === "guest") {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <Card className="w-full max-w-md">
          <h1 className="text-xl font-semibold text-zinc-900">語彙</h1>
          <p className="mt-2 text-sm text-zinc-600">
            閲覧するには{" "}
            <Link className="font-medium underline" href="/login">
              ログイン
            </Link>
            が必要です。
          </p>
        </Card>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="text-sm text-zinc-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-4xl space-y-4">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">語彙</h1>
              <p className="mt-1 text-sm text-zinc-600">公開中の語彙のみ表示します。</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setFilters({ level: "", entry_type: "", pos: "" })}
              >
                フィルタ解除
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800">TOPIK</span>
              <select
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={filters.level}
                onChange={(e) => setFilters((p) => ({ ...p, level: e.target.value }))}
              >
                <option value="">すべて</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}級
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800">種別</span>
              <select
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={filters.entry_type}
                onChange={(e) => setFilters((p) => ({ ...p, entry_type: e.target.value }))}
              >
                {ENTRY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800">品詞</span>
              <select
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={filters.pos}
                onChange={(e) => setFilters((p) => ({ ...p, pos: e.target.value }))}
              >
                {POS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              {loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>

          <div className="mt-4 divide-y divide-zinc-200">
            {(items ?? []).map((v) => (
              <Link
                key={v.id}
                href={`/vocabularies/${v.id}`}
                className="block py-3 hover:bg-zinc-50 -mx-6 px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium text-zinc-900">{v.term}</div>
                    <div className="mt-1 truncate text-sm text-zinc-600">{v.meaning_ja}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-500">
                    <div>{v.level_label_ja}</div>
                    <div className="mt-1">
                      {v.entry_type_label_ja} / {v.pos_label_ja}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {!loading && items && items.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-600">該当する語彙がありません。</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

