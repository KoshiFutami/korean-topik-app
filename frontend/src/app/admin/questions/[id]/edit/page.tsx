"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { QuestionForm } from "@/components/question/QuestionForm";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import {
  getAdminQuestion,
  updateAdminQuestion,
  type AdminQuestion,
  type QuestionFormData,
} from "@/lib/api/admin/questions";

const ADMIN_TOKEN_KEY = "topik.admin.token";

export default function AdminQuestionEditPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [token, setToken] = useState<string | null>(null);
  const [item, setItem] = useState<AdminQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(`/admin/questions/${id}/edit`)}`
      );
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
          router.replace(
            `/admin/login?next=${encodeURIComponent(`/admin/questions/${id}/edit`)}`
          );
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

  const handleSubmit = async (data: QuestionFormData) => {
    if (!token || !id) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateAdminQuestion(token, id, data);
      router.push(`/admin/questions/${id}`);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        router.replace(
          `/admin/login?next=${encodeURIComponent(`/admin/questions/${id}/edit`)}`
        );
        return;
      }
      if (e instanceof ApiError) {
        const fieldErrors = e.body?.errors
          ? Object.values(e.body.errors).flat().join(" / ")
          : undefined;
        setError(fieldErrors ?? e.message);
      } else {
        setError("問題の更新に失敗しました。");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            href={`/admin/questions/${id}`}
          >
            <span aria-hidden="true">←</span>
            詳細に戻る
          </Link>
        </div>

        <Card>
          <h1 className="text-xl font-semibold text-zinc-900">TOPIK 問題の編集</h1>

          {loading ? (
            <div className="mt-6 text-sm text-zinc-600">読み込み中...</div>
          ) : item ? (
            <div className="mt-6">
              <QuestionForm
                initial={item}
                onSubmit={handleSubmit}
                submitLabel="更新する"
                submitting={submitting}
                error={error}
              />
            </div>
          ) : (
            <div className="mt-6 text-sm text-red-600">{error ?? "問題が見つかりません。"}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
