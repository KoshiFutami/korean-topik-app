"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  fetchVocabulary,
  deleteVocabulary,
} from "@/lib/api/vocabulary";
import type { Vocabulary } from "@/lib/types/vocabulary";

const LEVEL_LABELS: Record<number, string> = {
  1: "TOPIK 1",
  2: "TOPIK 2",
  3: "TOPIK 3",
  4: "TOPIK 4",
  5: "TOPIK 5",
  6: "TOPIK 6",
};

export default function VocabularyListPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVocabulary();
      setVocabulary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (item: Vocabulary) => {
    if (!confirm(`「${item.korean}」を削除しますか？`)) return;
    try {
      await deleteVocabulary(item.id);
      setVocabulary((prev) => prev.filter((v) => v.id !== item.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">語彙管理</h1>
          <Link
            href="/admin/vocabulary/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ＋ 新規登録
          </Link>
        </div>

        {loading && (
          <p className="text-center text-gray-500">読み込み中...</p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              onClick={() => void load()}
              className="ml-3 underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !error && vocabulary.length === 0 && (
          <p className="text-center text-gray-500">
            登録された語彙がありません。
          </p>
        )}

        {!loading && vocabulary.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    韓国語
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    日本語
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    レベル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    例文
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vocabulary.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {item.korean}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.japanese}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {LEVEL_LABELS[item.level] ?? `Lv.${item.level}`}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                      {item.example_sentence ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/vocabulary/${item.id}/edit`}
                        className="mr-3 text-blue-600 hover:underline"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => void handleDelete(item)}
                        className="text-red-500 hover:underline"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
