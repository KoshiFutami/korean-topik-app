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
import { ApiError } from "@/lib/api/http";
import { getVocabulary, type UserVocabularyDetail } from "@/lib/api/vocabularies";

export default function VocabularyDetailPage() {
  const { state, refreshMe } = useAuth();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<UserVocabularyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [id, state]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="text-sm text-zinc-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-violet-700 via-fuchsia-600 to-orange-500 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/15"
            href="/vocabularies"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </Link>
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
                    <h1 className="truncate text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
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
                </Chip>
              ) : null}
              {item?.entry_type_label_ja ? (
                <Chip type="button" selected disabled>
                  {item.entry_type_label_ja}
                </Chip>
              ) : null}
              {item?.pos_label_ja ? (
                <Chip type="button" selected disabled>
                  {item.pos_label_ja}
                </Chip>
              ) : null}
            </div>

            {error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}
          </div>
        </Card>

        <Section title="例文">
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

