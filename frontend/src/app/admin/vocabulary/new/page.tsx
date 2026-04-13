"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import VocabularyForm from "@/components/features/vocabulary/VocabularyForm";
import { createVocabulary } from "@/lib/api/vocabulary";
import type { VocabularyFormData } from "@/lib/types/vocabulary";

export default function NewVocabularyPage() {
  const router = useRouter();

  const handleSubmit = async (data: VocabularyFormData) => {
    await createVocabulary(data);
    router.push("/admin/vocabulary");
  };

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
          <h1 className="text-2xl font-bold text-gray-800">語彙登録</h1>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <VocabularyForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/vocabulary")}
          />
        </div>
      </div>
    </div>
  );
}
