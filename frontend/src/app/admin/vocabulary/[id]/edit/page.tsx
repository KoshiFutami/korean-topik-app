"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import VocabularyForm from "@/components/features/vocabulary/VocabularyForm";
import { fetchVocabularyById, updateVocabulary } from "@/lib/api/vocabulary";
import type { Vocabulary, VocabularyFormData } from "@/lib/types/vocabulary";

export default function EditVocabularyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVocabularyById(id)
      .then(setVocabulary)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "語彙の読み込みに失敗しました",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: VocabularyFormData) => {
    await updateVocabulary(id, data);
    router.push("/admin/vocabulary");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !vocabulary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error ?? "語彙が見つかりません"}</p>
          <Link
            href="/admin/vocabulary"
            className="mt-3 block text-sm text-blue-600 hover:underline"
          >
            語彙一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin/vocabulary"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 語彙一覧
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">語彙編集</h1>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <VocabularyForm
            initialData={vocabulary}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/vocabulary")}
          />
        </div>
      </div>
    </div>
  );
}
