"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { getVocabulary, type UserVocabularyDetail } from "@/lib/api/vocabularies";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
      {children}
    </span>
  );
}

export default function VocabularyDetailPage() {
  const { state, refreshMe } = useAuth();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<UserVocabularyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.status === "guest") return;
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    const run = async () => {
      if (state.status !== "authed") return;
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getVocabulary(state.token, id);
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
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            href="/vocabularies"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </Link>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  {item?.term ?? "語彙"}
                </h1>
                <p className="mt-2 text-lg font-semibold text-zinc-900">{item?.meaning_ja ?? ""}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-zinc-500">
                <div className="font-medium">{item?.level_label_ja ?? ""}</div>
                <div className="mt-1">{item?.pos_label_ja ?? ""}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {item?.level_label_ja ? <Tag>{item.level_label_ja}</Tag> : null}
              {item?.entry_type_label_ja ? <Tag>{item.entry_type_label_ja}</Tag> : null}
              {item?.pos_label_ja ? <Tag>{item.pos_label_ja}</Tag> : null}
            </div>
          </div>

          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

          <div className="my-6 h-px bg-zinc-200" />

          <div className="grid gap-4 text-sm">
            <div className="text-sm font-semibold text-zinc-900">例文</div>

            {item?.example_sentence ? (
              <div className="flex gap-2">
                <div
                  className="shrink-0 self-start text-base leading-none"
                  aria-hidden="true"
                >
                  🇰🇷
                </div>
                <div className="text-zinc-900">{item.example_sentence}</div>
              </div>
            ) : (
              <div className="text-zinc-500">例文は未登録です。</div>
            )}

            {item?.example_translation_ja ? (
              <div className="flex gap-2">
                <div
                  className="shrink-0 self-start text-base leading-none"
                  aria-hidden="true"
                >
                  🇯🇵
                </div>
                <div className="text-zinc-700">{item.example_translation_ja}</div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="w-full sm:w-auto"
              type="button"
              disabled={loading}
              onClick={() => {
                if (state.status !== "authed") return;
                if (!id) return;
                setLoading(true);
                getVocabulary(state.token, id)
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
      </div>
    </div>
  );
}

