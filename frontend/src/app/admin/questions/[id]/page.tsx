"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { getAdminQuestion, deleteAdminQuestion, type AdminQuestion } from "@/lib/api/admin/questions";

const ADMIN_TOKEN_KEY = "topik.admin.token";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:gap-3">
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      <div className="text-sm text-zinc-900 sm:col-span-3">{value}</div>
    </div>
  );
}

export default function AdminQuestionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [token, setToken] = useState<string | null>(null);
  const [item, setItem] = useState<AdminQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/admin/questions/${id}`)}`);
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
        const res = await getAdminQuestion(token, id);
        setItem(res.question);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.replace(`/admin/login?next=${encodeURIComponent(`/admin/questions/${id}`)}`);
          return;
        }
        if (e instanceof ApiError) setError(e.message);
        else setError("問題の取得に失敗しました。");
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
            href="/admin/questions"
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
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-zinc-900">TOPIK 問題詳細</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {item
                  ? `${item.level_label_ja} ／ ${item.question_type_label_ja} ／ ${item.status_label_ja}`
                  : ""}
              </p>
            </div>
            <div className="shrink-0 text-right text-xs text-zinc-500">
              {item?.created_at ?? ""}
            </div>
          </div>

          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

          {loading ? (
            <div className="mt-6 text-sm text-zinc-600">読み込み中...</div>
          ) : item ? (
            <>
              <div className="mt-6 space-y-4">
                <Row label="レベル" value={item.level_label_ja} />
                <Row label="種別" value={item.question_type_label_ja} />
                <Row label="ステータス" value={item.status_label_ja} />
              </div>

              <div className="my-6 h-px bg-zinc-200" />

              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">問題文（韓国語）</div>
                <p className="whitespace-pre-wrap text-base text-zinc-900">{item.question_text}</p>
              </div>

              {item.question_text_ja ? (
                <div className="mt-4 space-y-1">
                  <div className="text-sm font-semibold text-zinc-700">問題文（日本語訳）</div>
                  <p className="whitespace-pre-wrap text-sm text-zinc-700">{item.question_text_ja}</p>
                </div>
              ) : null}

              <div className="my-6 h-px bg-zinc-200" />

              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">
                  選択肢（正解: {item.correct_option_number}番）
                </div>
                <ol className="space-y-2">
                  {item.options.map((o) => (
                    <li
                      key={o.option_number}
                      className={`flex items-start gap-3 rounded-md px-3 py-2 text-sm ${
                        o.is_correct
                          ? "bg-violet-50 font-semibold text-violet-900 ring-1 ring-inset ring-violet-200"
                          : "bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <span className="shrink-0 font-bold">{o.option_number}.</span>
                      <span className="flex-1">
                        {o.text}
                        {o.text_ja ? (
                          <span className="ml-2 text-xs text-zinc-500">（{o.text_ja}）</span>
                        ) : null}
                      </span>
                      {o.is_correct ? (
                        <span className="shrink-0 text-xs font-bold text-violet-600">✓ 正解</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>

              {item.explanation_ja ? (
                <>
                  <div className="my-6 h-px bg-zinc-200" />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-zinc-900">解説</div>
                    <p className="whitespace-pre-wrap text-sm text-zinc-700">{item.explanation_ja}</p>
                  </div>
                </>
              ) : null}

              <div className="mt-6 flex gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800"
                  href={`/admin/questions/${id}/edit`}
                >
                  編集
                </Link>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (!token || !id) return;
                    if (!window.confirm("この問題を削除しますか？")) return;
                    setLoading(true);
                    deleteAdminQuestion(token, id)
                      .then(() => router.push("/admin/questions"))
                      .catch((e) => {
                        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
                          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
                          router.replace(`/admin/login?next=${encodeURIComponent(`/admin/questions/${id}`)}`);
                          return;
                        }
                        if (e instanceof ApiError) setError(e.message);
                        else setError("問題の削除に失敗しました。");
                      })
                      .finally(() => setLoading(false));
                  }}
                >
                  削除
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-6 text-sm text-red-600">{error ?? "問題が見つかりません。"}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
