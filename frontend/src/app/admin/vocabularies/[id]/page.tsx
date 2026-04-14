"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HighlightedExampleText } from "@/components/vocabulary/HighlightedExampleText";
import { VocabularyInlineAudio } from "@/components/vocabulary/VocabularyInlineAudio";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { getAdminVocabulary, deleteAdminVocabulary, type AdminVocabulary } from "@/lib/api/admin/vocabularies";

const ADMIN_TOKEN_KEY = "topik.admin.token";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      <div className="text-sm text-zinc-900 sm:col-span-2">{value}</div>
    </div>
  );
}

export default function AdminVocabularyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [token, setToken] = useState<string | null>(null);
  const [item, setItem] = useState<AdminVocabulary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/admin/vocabularies/${id}`)}`);
      return;
    }
    setToken(t);
  }, [id, router]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminVocabulary(token, id);
        setItem(res.vocabulary);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.replace(`/admin/login?next=${encodeURIComponent(`/admin/vocabularies/${id}`)}`);
          return;
        }
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [id, router, token]);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            href="/admin/vocabularies"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </Link>
          <Link className="text-sm font-medium text-zinc-700 underline" href="/">
            学習者画面へ
          </Link>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-zinc-900">
                {item?.term ?? "語彙詳細"}
              </h1>
              <p className="mt-1 text-sm text-zinc-600">{item?.meaning_ja ?? ""}</p>
            </div>
            <div className="shrink-0 text-right text-xs text-zinc-500">
              <div>{item?.status_label_ja ?? item?.status ?? ""}</div>
              <div className="mt-1">{item?.created_at ?? ""}</div>
            </div>
          </div>

          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

          <div className="mt-6 space-y-4">
            <Row label="TOPIK" value={item?.level_label_ja ?? (item ? `${item.level}級` : "")} />
            <Row label="種別" value={item?.entry_type_label_ja ?? item?.entry_type ?? ""} />
            <Row label="品詞" value={item?.pos_label_ja ?? item?.pos ?? ""} />
            <Row label="ステータス" value={item?.status_label_ja ?? item?.status ?? ""} />
            <Row
              label="音声URL"
              value={
                item?.audio_url ? (
                  <a className="underline" href={item.audio_url}>
                    {item.audio_url}
                  </a>
                ) : (
                  <span className="text-zinc-500">なし</span>
                )
              }
            />
            {item?.audio_url ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-800">再生プレビュー</div>
                <VocabularyInlineAudio className="mt-2" src={item.audio_url} />
              </div>
            ) : null}
          </div>

          <div className="my-6 h-px bg-zinc-200" />

          <div className="space-y-4 text-base leading-relaxed">
            <div className="text-sm font-semibold text-zinc-900">例文</div>

            {item?.example_sentence ? (
              <div className="text-zinc-900 whitespace-pre-wrap">
                <HighlightedExampleText
                  text={item.example_sentence}
                  markClassName="font-semibold text-zinc-900 underline decoration-amber-600/55 decoration-2 underline-offset-[0.2em]"
                />
              </div>
            ) : (
              <div className="text-zinc-500">例文は未登録です。</div>
            )}

            {item?.example_translation_ja ? (
              <div className="text-zinc-700 whitespace-pre-wrap">
                <HighlightedExampleText
                  text={item.example_translation_ja}
                  markClassName="font-semibold text-zinc-800 underline decoration-sky-600/50 decoration-2 underline-offset-[0.2em]"
                />
              </div>
            ) : null}

            <Row
              label="例文音声URL"
              value={
                item?.example_audio_url ? (
                  <a className="underline" href={item.example_audio_url}>
                    {item.example_audio_url}
                  </a>
                ) : (
                  <span className="text-zinc-500">なし</span>
                )
              }
            />
            {item?.example_audio_url ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-800">再生プレビュー</div>
                <VocabularyInlineAudio className="mt-2" src={item.example_audio_url} />
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
              href={`/admin/vocabularies/${id}/edit`}
            >
              編集
            </Link>
            <Button
              variant="secondary"
              type="button"
              disabled={loading}
              onClick={() => {
                if (!token || !id) return;
                if (!window.confirm(`「${item?.term ?? "この語彙"}」を削除しますか？`)) return;
                setLoading(true);
                deleteAdminVocabulary(token, id)
                  .then(() => router.push("/admin/vocabularies"))
                  .catch((e) => {
                    if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
                      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
                      router.replace(`/admin/login?next=${encodeURIComponent(`/admin/vocabularies/${id}`)}`);
                      return;
                    }
                    if (e instanceof ApiError) setError(e.message);
                    else setError("語彙の削除に失敗しました。");
                  })
                  .finally(() => setLoading(false));
              }}
            >
              削除
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

