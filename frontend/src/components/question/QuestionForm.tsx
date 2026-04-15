"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { AdminQuestion, QuestionFormData, QuestionOptionFormData } from "@/lib/api/admin/questions";

const LEVEL_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1級 (TOPIK I)" },
  { value: 2, label: "2級 (TOPIK I)" },
  { value: 3, label: "3級 (TOPIK II)" },
  { value: 4, label: "4級 (TOPIK II)" },
  { value: 5, label: "5級 (TOPIK II)" },
  { value: 6, label: "6級 (TOPIK II)" },
];

const QUESTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "grammar", label: "文法（빈칸 穴埋め）" },
  { value: "topic", label: "主題（무엇에 대한）" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
];

type Props = {
  initial?: AdminQuestion;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
};

const DEFAULT_OPTIONS: QuestionOptionFormData[] = [
  { option_number: 1, text: "", text_ja: null, is_correct: true },
  { option_number: 2, text: "", text_ja: null, is_correct: false },
  { option_number: 3, text: "", text_ja: null, is_correct: false },
  { option_number: 4, text: "", text_ja: null, is_correct: false },
];

export function QuestionForm({ initial, onSubmit, submitLabel, submitting, error }: Props) {
  const [level, setLevel] = useState<number>(initial?.level ?? 1);
  const [questionType, setQuestionType] = useState(initial?.question_type ?? "grammar");
  const [questionText, setQuestionText] = useState(initial?.question_text ?? "");
  const [questionTextJa, setQuestionTextJa] = useState(initial?.question_text_ja ?? "");
  const [explanationJa, setExplanationJa] = useState(initial?.explanation_ja ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [options, setOptions] = useState<QuestionOptionFormData[]>(
    initial
      ? initial.options.map((o) => ({
          option_number: o.option_number,
          text: o.text,
          text_ja: o.text_ja,
          is_correct: o.is_correct,
        }))
      : DEFAULT_OPTIONS
  );

  const selectCls =
    "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20";

  const updateOption = (index: number, key: keyof QuestionOptionFormData, value: string | boolean | null) => {
    if (key === "is_correct" && value === true) {
      setCorrectOption(index);
      return;
    }
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, [key]: value } : o)));
  };

  const setCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, is_correct: i === index }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      level,
      question_type: questionType,
      question_text: questionText,
      question_text_ja: questionTextJa || null,
      explanation_ja: explanationJa || null,
      status,
      options,
    });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800">
            TOPIKレベル <span className="ml-2 text-xs font-semibold opacity-80">必須</span>
          </span>
          <select
            className={selectCls}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800">
            問題種別 <span className="ml-2 text-xs font-semibold opacity-80">必須</span>
          </span>
          <select
            className={selectCls}
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            {QUESTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">
          問題文（韓国語）<span className="ml-2 text-xs font-semibold opacity-80">必須</span>
        </span>
        <textarea
          className="min-h-[100px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          placeholder="例: 빈칸에 들어갈 알맞은 것을 고르십시오.&#10;저는 학교( ) 가요."
        />
        <span className="text-xs text-zinc-500">文法問題は空欄を ( ) で示してください。</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">問題文（日本語訳）</span>
        <textarea
          className="min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
          value={questionTextJa}
          onChange={(e) => setQuestionTextJa(e.target.value)}
          placeholder="問題文の日本語訳（任意）"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">解説（日本語）</span>
        <textarea
          className="min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
          value={explanationJa}
          onChange={(e) => setExplanationJa(e.target.value)}
          placeholder="解説があれば入力してください"
        />
      </label>

      <div>
        <div className="mb-3 text-sm font-medium text-zinc-800">
          選択肢 <span className="ml-2 text-xs font-semibold opacity-80">必須（◎ で正解を選択）</span>
        </div>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.option_number} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setCorrectOption(index)}
                className={`mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  option.is_correct
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-400 hover:border-zinc-400"
                }`}
                title="正解に設定"
              >
                {option.option_number}
              </button>
              <div className="flex flex-1 gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, "text", e.target.value)}
                    required
                    placeholder={`選択肢 ${option.option_number}（韓国語）`}
                    className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text_ja ?? ""}
                    onChange={(e) => updateOption(index, "text_ja", e.target.value || null)}
                    placeholder="日本語訳（任意）"
                    className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">番号ボタンをクリックして正解の選択肢を設定してください。</p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">ステータス</span>
        <select
          className={selectCls}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "送信中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
