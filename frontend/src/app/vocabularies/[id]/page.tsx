"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { addBookmark, listBookmarks, removeBookmark } from "@/lib/api/bookmarks";
import { ApiError } from "@/lib/api/http";
import { getVocabulary, type UserVocabularyDetail } from "@/lib/api/vocabularies";

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

export default function VocabularyDetailPage() {
  const { state, refreshMe } = useAuth();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<UserVocabularyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const token = state.status === "authed" ? state.token : null;
        const res = await getVocabulary(token, id);
        setItem(res.vocabulary);
        if (state.status === "authed") {
          const bRes = await listBookmarks(state.token);
          setBookmarked(bRes.bookmarks.some((b) => b.id === id));
        } else {
          setBookmarked(null);
        }
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [id, state]);

  const handleBookmarkToggle = async () => {
    if (state.status !== "authed" || !id || bookmarkBusy) return;
    setBookmarkBusy(true);
    setError(null);
    try {
      if (bookmarked) {
        await removeBookmark(state.token, id);
        setBookmarked(false);
      } else {
        await addBookmark(state.token, id);
        setBookmarked(true);
      }
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("ブックマークの操作に失敗しました。");
    } finally {
      setBookmarkBusy(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="text-sm text-zinc-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/15"
            href="/vocabularies"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </Link>
          {state.status === "authed" && bookmarked !== null ? (
            <button
              type="button"
              disabled={bookmarkBusy || loading}
              onClick={handleBookmarkToggle}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors",
                bookmarked
                  ? "bg-white/20 text-white ring-white/30 hover:bg-white/30"
                  : "bg-white/10 text-white/80 ring-white/25 hover:bg-white/15",
                bookmarkBusy ? "opacity-60" : "",
              ].join(" ")}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill={bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {bookmarkBusy
                ? "저장 중..."
                : bookmarked
                  ? "저장됨"
                  : "북마크"}
            </button>
          ) : null}
        </div>

        <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {loading && !item ? (
                  <>
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="mt-3 h-6 w-64" />
                  </>
                ) : (
                  <>
                    <h1 className="truncate text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl">
                      {item?.term ?? "語彙"}
                    </h1>
                    <p className="mt-2 text-lg font-semibold text-white/90">{item?.meaning_ja ?? ""}</p>
                  </>
                )}
              </div>
              <div className="shrink-0 text-right text-xs text-white/80">
                <div className="font-semibold">{item?.level_label_ja ?? ""}</div>
                <div className="mt-1">{item?.pos_label_ja ?? ""}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {item?.level_label_ja ? (
                <Chip type="button" selected disabled>
                  {item.level_label_ja}
                  <span className="ml-1 text-[11px] font-semibold opacity-80">
                    {typeof item.level === "number" ? `${item.level}급` : ""}
                  </span>
                </Chip>
              ) : null}
              {item?.entry_type_label_ja ? (
                <Chip type="button" selected disabled>
                  {item.entry_type_label_ja}
                  <span className="ml-1 text-[11px] font-semibold opacity-80">
                    {item.entry_type ? entryTypeKo(item.entry_type) : ""}
                  </span>
                </Chip>
              ) : null}
              {item?.pos_label_ja ? (
                <Chip type="button" selected disabled>
                  {item.pos_label_ja}
                  <span className="ml-1 text-[11px] font-semibold opacity-80">
                    {item.pos ? posKo(item.pos) : ""}
                  </span>
                </Chip>
              ) : null}
            </div>

            {error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}
          </div>
        </Card>

        <Section
          title="例文"
          subtitle="예문"
          headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
          titleClassName="text-white drop-shadow-sm"
          descriptionClassName="text-white/80"
        >
          <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
            <div className="grid gap-4 text-sm">
              {item?.example_sentence ? (
                <div className="flex gap-3">
                  <div className="shrink-0 self-start text-base leading-none" aria-hidden="true">
                    🇰🇷
                  </div>
                  <div className="text-white/90">{item.example_sentence}</div>
                </div>
              ) : (
                <div className="text-white/70">例文は未登録です。</div>
              )}

              {item?.example_translation_ja ? (
                <div className="flex gap-3">
                  <div className="shrink-0 self-start text-base leading-none" aria-hidden="true">
                    🇯🇵
                  </div>
                  <div className="text-white/80">{item.example_translation_ja}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <Button
                className="w-full sm:w-auto"
                type="button"
                disabled={loading}
                onClick={() => {
                  if (!id) return;
                  setLoading(true);
                  const token = state.status === "authed" ? state.token : null;
                  getVocabulary(token, id)
                    .then((res) => setItem(res.vocabulary))
                    .catch((e) => {
                      if (e instanceof ApiError) setError(e.message);
                      else setError("語彙の取得に失敗しました。");
                    })
                    .finally(() => setLoading(false));
                }}
              >
                {loading ? "更新中..." : "更新"}
              </Button>
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}

