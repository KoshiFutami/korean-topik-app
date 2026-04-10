"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { getVocabulary, type UserVocabularyDetail } from "@/lib/api/vocabularies";

export default function VocabularyDetailPage({ params }: { params: { id: string } }) {
  const { state, refreshMe } = useAuth();
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
      setLoading(true);
      setError(null);
      try {
        const res = await getVocabulary(state.token, params.id);
        setItem(res.vocabulary);
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [params.id, state]);

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
          <Link className="text-sm font-medium text-zinc-700 underline" href="/vocabularies">
            一覧へ戻る
          </Link>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-zinc-900">
                {item?.term ?? "語彙"}
              </h1>
              <p className="mt-2 text-base text-zinc-700">{item?.meaning_ja ?? ""}</p>
            </div>
            <div className="shrink-0 text-right text-xs text-zinc-500">
              <div>{item?.level_label_ja ?? ""}</div>
              <div className="mt-1">
                {item?.entry_type_label_ja ?? ""} / {item?.pos_label_ja ?? ""}
              </div>
            </div>
          </div>

          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

          <div className="mt-6 grid gap-3 text-sm">
            {item?.example_sentence ? (
              <div>
                <div className="text-zinc-500">例文</div>
                <div className="mt-1 text-zinc-900">{item.example_sentence}</div>
              </div>
            ) : null}
            {item?.example_translation_ja ? (
              <div>
                <div className="text-zinc-500">例文（日本語）</div>
                <div className="mt-1 text-zinc-900">{item.example_translation_ja}</div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              type="button"
              disabled={loading}
              onClick={() => {
                if (state.status !== "authed") return;
                setLoading(true);
                getVocabulary(state.token, params.id)
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

