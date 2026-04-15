"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { QuestionForm } from "@/components/question/QuestionForm";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { createAdminQuestion, type QuestionFormData } from "@/lib/api/admin/questions";

const ADMIN_TOKEN_KEY = "topik.admin.token";

export default function AdminQuestionNewPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent("/admin/questions/new")}`);
      return;
    }
    setToken(t);
  }, [router]);

  const handleSubmit = async (data: QuestionFormData) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createAdminQuestion(token, data);
      router.push(`/admin/questions/${res.question.id}`);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        router.replace(`/admin/login?next=${encodeURIComponent("/admin/questions/new")}`);
        return;
      }
      if (e instanceof ApiError) {
        const fieldErrors = e.body?.errors
          ? Object.values(e.body.errors).flat().join(" / ")
          : undefined;
        setError(fieldErrors ?? e.message);
      } else {
        setError("問題の登録に失敗しました。");
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
            href="/admin/questions"
          >
            <span aria-hidden="true">←</span>
            一覧に戻る
          </Link>
        </div>

        <Card>
          <h1 className="text-xl font-semibold text-zinc-900">TOPIK 問題の新規登録</h1>
          <div className="mt-6">
            <QuestionForm
              onSubmit={handleSubmit}
              submitLabel="登録する"
              submitting={submitting}
              error={error}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
