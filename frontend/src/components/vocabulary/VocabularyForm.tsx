"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AdminVocabulary, VocabularyFormData } from "@/lib/api/admin/vocabularies";

const POS_OPTIONS: { value: string; label: string }[] = [
  { value: "noun", label: "名詞" },
  { value: "verb", label: "動詞" },
  { value: "adj", label: "形容詞" },
  { value: "adv", label: "副詞" },
  { value: "particle", label: "助詞" },
  { value: "determiner", label: "冠形詞" },
  { value: "pronoun", label: "代名詞" },
  { value: "interjection", label: "感動詞" },
  { value: "other", label: "その他" },
];

const ENTRY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "word", label: "単語" },
  { value: "phrase", label: "熟語" },
  { value: "idiom", label: "慣用句" },
];

const LEVEL_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1級" },
  { value: 2, label: "2級" },
  { value: 3, label: "3級" },
  { value: 4, label: "4級" },
  { value: 5, label: "5級" },
  { value: 6, label: "6級" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
  { value: "archived", label: "アーカイブ" },
];

type Props = {
  initial?: AdminVocabulary;
  onSubmit: (data: VocabularyFormData) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
};

export function VocabularyForm({ initial, onSubmit, submitLabel, submitting, error }: Props) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [meaningJa, setMeaningJa] = useState(initial?.meaning_ja ?? "");
  const [pos, setPos] = useState(initial?.pos ?? "noun");
  const [level, setLevel] = useState<number>(initial?.level ?? 1);
  const [entryType, setEntryType] = useState(initial?.entry_type ?? "word");
  const [exampleSentence, setExampleSentence] = useState(initial?.example_sentence ?? "");
  const [exampleTranslationJa, setExampleTranslationJa] = useState(
    initial?.example_translation_ja ?? ""
  );
  const [audioUrl, setAudioUrl] = useState(initial?.audio_url ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");

  const selectCls =
    "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      term,
      meaning_ja: meaningJa,
      pos,
      level,
      entry_type: entryType,
      example_sentence: exampleSentence || null,
      example_translation_ja: exampleTranslationJa || null,
      audio_url: audioUrl || null,
      status,
    });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
      <Input
        label="見出し語（韓国語）"
        labelSuffix="必須"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        required
        placeholder="예: 학교"
      />

      <Input
        label="意味（日本語）"
        labelSuffix="必須"
        value={meaningJa}
        onChange={(e) => setMeaningJa(e.target.value)}
        required
        placeholder="例: 学校"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800">
            品詞 <span className="ml-2 text-xs font-semibold opacity-80">必須</span>
          </span>
          <select className={selectCls} value={pos} onChange={(e) => setPos(e.target.value)}>
            {POS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

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
          <span className="text-sm font-medium text-zinc-800">種別</span>
          <select
            className={selectCls}
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
          >
            {ENTRY_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">例文（韓国語）</span>
        <textarea
          className="min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
          value={exampleSentence}
          onChange={(e) => setExampleSentence(e.target.value)}
          placeholder="例文があれば入力してください"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-800">例文訳（日本語）</span>
        <textarea
          className="min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/20"
          value={exampleTranslationJa}
          onChange={(e) => setExampleTranslationJa(e.target.value)}
          placeholder="例文の日本語訳があれば入力してください"
        />
      </label>

      <Input
        label="音声URL"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        placeholder="https://..."
        type="url"
      />

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
