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
      <div className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10 text-[#F0F0FF]">
        <div className="text-sm text-[#9499C4]">読み込み中...</div>
      </div>
    );
  }

  if (state.status === "guest") {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10 text-[#F0F0FF]">
        <Card className="w-full max-w-md space-y-4 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F0F0FF]">
              ブックマークは会員の方のみ
              <span className="mt-1 block text-base font-semibold text-[#9499C4]">
                북마크는 회원 전용이에요
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#BCC0E8]">
              ブックマークに語彙を保存したり、一覧で復習したりするには
              <strong className="text-[#F0F0FF]">無料の会員登録（アカウント作成）</strong>
              が必要です。登録後はいつでもログインしてご利用いただけます。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#9499C4]">
              まずはアカウントを作成して、自分だけの単語リストを作ってみましょう。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366f1,#3b82f6)] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:opacity-90"
            >
              無料で会員登録
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-center text-sm font-semibold text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
            >
              ログイン
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.10)]"
        style={{ width: 500, height: 350, top: -80, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-5xl space-y-6">
        <Section
          title="保存済み語彙"
          subtitle="저장된 단어"
          description={loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
          right={error ? <div className="text-sm font-medium text-[#fb7185]">{error}</div> : null}
          headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
          titleClassName="text-[#F0F0FF]"
          descriptionClassName="text-[#9499C4]"
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <BookmarkListVirtualGrid items={items} removing={removing} onRemove={handleRemove} />
          ) : null}

          {!loading && items && items.length === 0 ? (
            <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-center text-[#F0F0FF] backdrop-blur-xl">
              <div className="text-sm font-semibold text-[#F0F0FF]">
                ブックマークがありません
              </div>
              <div className="mt-1 text-sm text-[#9499C4]">
                語彙詳細ページからブックマークに追加できます。
              </div>
              <div className="mt-4">
                <Link
                  href="/vocabularies"
                  className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm font-medium text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
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
