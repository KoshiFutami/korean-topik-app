"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { HighlightedExampleText } from "@/components/vocabulary/HighlightedExampleText";
import { VocabularyAudioPlayButton } from "@/components/vocabulary/VocabularyAudioPlayButton";
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
  const router = useRouter();
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
        style={{ width: 500, height: 350, top: -80, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#BCC0E8] backdrop-blur-xl hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08091A]"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </button>
          {state.status === "guest" ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="会員登録が必要です"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-sm font-medium text-[#5C6199]"
            >
              <span aria-hidden="true" className="text-base leading-none">🏷️</span>
              ブックマーク
            </button>
          ) : state.status === "authed" && bookmarked !== null ? (
            <button
              type="button"
              disabled={bookmarkBusy || loading}
              onClick={handleBookmarkToggle}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                bookmarked
                  ? "bg-[rgba(99,102,241,0.15)] text-[#818cf8] border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.2)]"
                  : "bg-[rgba(255,255,255,0.05)] text-[#BCC0E8] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]",
                bookmarkBusy ? "opacity-60" : "",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {bookmarked ? "🔖" : "🏷️"}
              </span>
              {bookmarkBusy
                ? "저장 중..."
                : bookmarked
                  ? "저장됨"
                  : "북마크"}
            </button>
          ) : null}
        </div>

        {state.status === "guest" ? (
          <Card className="border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.08)] text-[#F0F0FF] backdrop-blur-xl">
            <p className="text-sm font-semibold text-[#818cf8]">ブックマークは会員の方のみご利用いただけます</p>
            <p className="mt-2 text-sm leading-relaxed text-[#BCC0E8]">
              語彙をブックマークに保存するには、
              <strong className="text-[#F0F0FF]">無料の会員登録</strong>
              が必要です。アカウントをお持ちの方はログインしてください。
            </p>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold">
              <Link
                className="rounded-xl bg-[linear-gradient(135deg,#6366f1,#3b82f6)] px-3 py-1.5 text-white hover:opacity-90"
                href="/register"
              >
                無料で会員登録
              </Link>
              <Link
                className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-[#BCC0E8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]"
                href="/login"
              >
                ログイン
              </Link>
            </p>
          </Card>
        ) : null}

        <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
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
                    <h1 className="truncate text-4xl font-extrabold tracking-tight text-[#F0F0FF] sm:text-5xl">
                      {item?.term ?? "語彙"}
                    </h1>
                    <p className="mt-2 text-lg font-semibold text-[#BCC0E8]">{item?.meaning_ja ?? ""}</p>
                  </>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 text-right text-xs text-[#9499C4]">
                <div>
                  <div className="font-semibold">{item?.level_label_ja ?? ""}</div>
                  <div className="mt-1">{item?.pos_label_ja ?? ""}</div>
                </div>
                {item?.id ? (
                  <VocabularyAudioPlayButton vocabularyId={item.id} initialAudioUrl={item.audio_url} />
                ) : null}
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

            {error ? <div className="text-sm font-medium text-[#fb7185]">{error}</div> : null}
          </div>
        </Card>

        <Section
          title="例文"
          subtitle="예문"
          headerClassName="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-xl"
          titleClassName="text-[#F0F0FF]"
          descriptionClassName="text-[#9499C4]"
        >
          <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <div className="grid gap-4 text-base leading-relaxed">
              {item?.example_sentence ? (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="shrink-0 self-start text-lg leading-none" aria-hidden="true">
                      🇰🇷
                    </div>
                    <div className="min-w-0 text-[#BCC0E8]">
                      <HighlightedExampleText
                        text={item.example_sentence}
                        markClassName="font-semibold text-[#818cf8] underline decoration-[rgba(99,102,241,0.5)] decoration-2 underline-offset-[0.22em]"
                      />
                    </div>
                  </div>
                  {item.id ? (
                    <VocabularyAudioPlayButton
                      vocabularyId={item.id}
                      scope="example"
                      initialAudioUrl={item.example_audio_url}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="text-base text-[#5C6199]">例文は未登録です。</div>
              )}

              {item?.example_translation_ja ? (
                <div className="flex gap-3">
                  <div className="shrink-0 self-start text-lg leading-none" aria-hidden="true">
                    🇯🇵
                  </div>
                  <div className="text-[#9499C4]">
                    <HighlightedExampleText
                      text={item.example_translation_ja}
                      markClassName="font-semibold text-[#BCC0E8] underline decoration-[rgba(99,102,241,0.4)] decoration-2 underline-offset-[0.22em]"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}
