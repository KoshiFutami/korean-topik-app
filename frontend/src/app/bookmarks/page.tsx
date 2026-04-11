"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  listBookmarks,
  removeBookmark,
  type BookmarkVocabulary,
} from "@/lib/api/bookmarks";
import { ApiError } from "@/lib/api/http";

function posKo(pos: string): string {
  switch (pos) {
    case "noun":
      return "명사";
    case "verb":
      return "동사";
    case "adj":
      return "형용사";
    case "adv":
      return "부사";
    case "particle":
      return "조사";
    case "determiner":
      return "관형사";
    case "pronoun":
      return "대명사";
    case "interjection":
      return "감탄사";
    default:
      return "기타";
  }
}

function entryTypeKo(t: string): string {
  switch (t) {
    case "word":
      return "단어";
    case "phrase":
      return "숙어";
    case "idiom":
      return "관용구";
    default:
      return "";
  }
}

export default function BookmarksPage() {
  const { state, refreshMe } = useAuth();
  const [items, setItems] = useState<BookmarkVocabulary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    if (state.status !== "authed") return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listBookmarks(state.token);
        setItems(res.bookmarks);
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("ブックマークの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [state]);

  const handleRemove = async (vocabularyId: string) => {
    if (state.status !== "authed") return;
    setRemoving(vocabularyId);
    try {
      await removeBookmark(state.token, vocabularyId);
      setItems((prev) => (prev ? prev.filter((v) => v.id !== vocabularyId) : prev));
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("ブックマークの削除に失敗しました。");
    } finally {
      setRemoving(null);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
        <div className="text-sm text-white/80">読み込み中...</div>
      </div>
    );
  }

  if (state.status === "guest") {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
        <Card className="w-full max-w-md border-white/10 bg-white/10 text-white backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            未ログイン
            <span className="ml-2 align-baseline text-base font-semibold text-white/85">
              로그인 필요
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/80">
            続けるには{" "}
            <Link className="font-semibold underline" href="/login">
              ログイン
            </Link>
            してください。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            ブックマーク
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">
              북마크
            </span>
          </h1>
          <p className="text-sm text-white/80">保存した語彙を確認できます。</p>
        </div>

        <Section
          title="保存済み語彙"
          subtitle="저장된 단어"
          description={loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
          right={error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}
          headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
          titleClassName="text-white drop-shadow-sm"
          descriptionClassName="text-white/80"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
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
                  <Card
                    key={v.id}
                    className={[
                      "p-5",
                      "bg-gradient-to-br",
                      idx % 3 === 0 ? "from-violet-700/60 via-fuchsia-600/40 to-orange-500/50" : "",
                      idx % 3 === 1 ? "from-sky-500/60 via-emerald-500/40 to-lime-400/40" : "",
                      idx % 3 === 2 ? "from-orange-500/70 via-rose-500/40 to-violet-700/50" : "",
                      "border-white/10 text-white backdrop-blur",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/vocabularies/${v.id}`} className="min-w-0 flex-1">
                        <div className="truncate text-lg font-extrabold text-white hover:underline">
                          {v.term}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-white/85">
                          {v.meaning_ja}
                        </div>
                      </Link>
                      <div className="shrink-0 text-right text-xs text-white/80">
                        <div className="font-semibold">{v.level_label_ja}</div>
                        <div className="mt-1">{v.pos_label_ja}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip type="button" selected disabled>
                        {v.entry_type_label_ja}
                        <span className="ml-1 text-[11px] font-semibold opacity-80">
                          {entryTypeKo(v.entry_type)}
                        </span>
                      </Chip>
                      <Chip type="button" selected disabled>
                        {v.pos_label_ja}
                        <span className="ml-1 text-[11px] font-semibold opacity-80">
                          {posKo(v.pos)}
                        </span>
                      </Chip>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-white/60">
                        {new Date(v.bookmarked_at).toLocaleDateString("ja-JP")}
                      </span>
                      <Button
                        variant="secondary"
                        type="button"
                        disabled={removing === v.id}
                        onClick={() => handleRemove(v.id)}
                      >
                        {removing === v.id ? "削除中..." : "削除"}
                      </Button>
                    </div>
                  </Card>
                ))}
          </div>

          {!loading && items && items.length === 0 ? (
            <Card className="border-white/10 bg-white/10 text-center text-white backdrop-blur">
              <div className="text-sm font-semibold text-white">
                ブックマークがありません
              </div>
              <div className="mt-1 text-sm text-white/80">
                語彙詳細ページからブックマークに追加できます。
              </div>
              <div className="mt-4">
                <Link
                  href="/vocabularies"
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/15"
                >
                  語彙一覧へ
                </Link>
              </div>
            </Card>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
