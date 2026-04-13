"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookmarkListVirtualGrid } from "@/components/vocabulary/BookmarkListVirtualGrid";
import {
  listBookmarks,
  removeBookmark,
  type BookmarkVocabulary,
} from "@/lib/api/bookmarks";
import { ApiError } from "@/lib/api/http";

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
        <Card className="w-full max-w-md space-y-4 border-white/10 bg-white/10 text-white backdrop-blur">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              ブックマークは会員の方のみ
              <span className="mt-1 block text-base font-semibold text-white/85">
                북마크는 회원 전용이에요
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              ブックマークに語彙を保存したり、一覧で復習したりするには
              <strong className="text-white">無料の会員登録（アカウント作成）</strong>
              が必要です。登録後はいつでもログインしてご利用いただけます。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              まずはアカウントを作成して、自分だけの単語リストを作ってみましょう。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-900 hover:bg-white/90"
            >
              無料で会員登録
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/15"
            >
              ログイン
            </Link>
          </div>
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
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <BookmarkListVirtualGrid items={items} removing={removing} onRemove={handleRemove} />
          ) : null}

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
