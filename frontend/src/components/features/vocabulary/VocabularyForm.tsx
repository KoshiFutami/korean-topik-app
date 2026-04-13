"use client";

import { useState } from "react";
import type { Vocabulary, VocabularyFormData } from "@/lib/types/vocabulary";

type Props = {
  initialData?: Vocabulary;
  onSubmit: (data: VocabularyFormData) => Promise<void>;
  onCancel: () => void;
};

export default function VocabularyForm({ initialData, onSubmit, onCancel }: Props) {
  const [korean, setKorean] = useState(initialData?.korean ?? "");
  const [japanese, setJapanese] = useState(initialData?.japanese ?? "");
  const [level, setLevel] = useState<number>(initialData?.level ?? 1);
  const [exampleSentence, setExampleSentence] = useState(
    initialData?.example_sentence ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!korean.trim()) newErrors.korean = "韓国語を入力してください";
    if (!japanese.trim()) newErrors.japanese = "日本語を入力してください";
    if (level < 1 || level > 6) newErrors.level = "レベルは1〜6で入力してください";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        korean: korean.trim(),
        japanese: japanese.trim(),
        level,
        example_sentence: exampleSentence.trim() || undefined,
      });
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "エラーが発生しました" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-600">
          {errors.general}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="korean">
          韓国語 <span className="text-red-500">*</span>
        </label>
        <input
          id="korean"
          type="text"
          value={korean}
          onChange={(e) => setKorean(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="예: 안녕하세요"
        />
        {errors.korean && (
          <p className="mt-1 text-xs text-red-500">{errors.korean}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="japanese">
          日本語 <span className="text-red-500">*</span>
        </label>
        <input
          id="japanese"
          type="text"
          value={japanese}
          onChange={(e) => setJapanese(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="例: こんにちは"
        />
        {errors.japanese && (
          <p className="mt-1 text-xs text-red-500">{errors.japanese}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="level">
          レベル (1〜6) <span className="text-red-500">*</span>
        </label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <option key={l} value={l}>
              TOPIK {l}
            </option>
          ))}
        </select>
        {errors.level && (
          <p className="mt-1 text-xs text-red-500">{errors.level}</p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="exampleSentence"
        >
          例文（任意）
        </label>
        <textarea
          id="exampleSentence"
          value={exampleSentence}
          onChange={(e) => setExampleSentence(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="예: 안녕하세요, 저는 학생입니다."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "保存中..." : initialData ? "更新する" : "登録する"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
