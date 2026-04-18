"use client";

import { useWindowVirtualizer, measureElement } from "@tanstack/react-virtual";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { Card } from "@/components/ui/Card";
import { VocabularyAudioPlayButton } from "@/components/vocabulary/VocabularyAudioPlayButton";
import type { UserVocabulary } from "@/lib/api/vocabularies";
import { saveVocabularyListContext } from "@/lib/vocabularyListContext";

function subscribeWindowResize(onStoreChange: () => void): () => void {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getColumnCountFromWidth(): number {
  const w = window.innerWidth;
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
}

/** Tailwind の sm / lg ブレークポイントに合わせた列数（SSR は 1 列） */
function useResponsiveColumnCount(): number {
  return useSyncExternalStore(
    subscribeWindowResize,
    getColumnCountFromWidth,
    () => 1,
  );
}

function posKo(pos: string): string {
  switch (pos) {
    case "noun":
      return "명사";
    case "verb":
      return "동사";
    case "adj":
      return "형용사";
    case "adv":
      return "부사";
    case "particle":
      return "조사";
    case "determiner":
      return "관형사";
    case "pronoun":
      return "대명사";
    case "interjection":
      return "감탄사";
    default:
      return "기타";
  }
}

function entryTypeKo(t: string): string {
  switch (t) {
    case "word":
      return "단어";
    case "phrase":
      return "숙어";
    case "idiom":
      return "관용구";
    default:
      return "";
  }
}

function VocabularyGridCard({
  vocabulary: v,
  paletteIndex,
  allIds,
}: {
  vocabulary: UserVocabulary;
  paletteIndex: number;
  allIds: string[];
}) {
  const palette = paletteIndex % 3;
  return (
    <Card
      className={[
        "group relative p-5 transition-transform hover:-translate-y-0.5 hover:shadow-md",
        "bg-gradient-to-br",
        palette === 0 ? "from-violet-700/60 via-fuchsia-600/40 to-orange-500/50" : "",
        palette === 1 ? "from-sky-500/60 via-emerald-500/40 to-lime-400/40" : "",
        palette === 2 ? "from-orange-500/70 via-rose-500/40 to-violet-700/50" : "",
        "border-white/10 text-white backdrop-blur",
      ].join(" ")}
    >
      <Link
        href={`/vocabularies/${v.id}`}
        onClick={() => saveVocabularyListContext(allIds)}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={`${v.term} - ${v.meaning_ja}`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold text-white group-hover:underline">{v.term}</div>
          <div className="mt-1 line-clamp-2 text-sm text-white/85">{v.meaning_ja}</div>
        </div>
        <div className="relative z-10 flex shrink-0 flex-col items-end gap-2">
          <div className="text-right text-xs text-white/80">
            <div className="font-semibold">{v.level_label_ja}</div>
            <div className="mt-1">{v.pos_label_ja}</div>
          </div>
          <VocabularyAudioPlayButton vocabularyId={v.id} initialAudioUrl={v.audio_url} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
          {v.entry_type_label_ja}
          <span className="ml-1 text-[11px] font-semibold text-white/80">{entryTypeKo(v.entry_type)}</span>
        </span>
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
          {v.pos_label_ja}
          <span className="ml-1 text-[11px] font-semibold text-white/80">{posKo(v.pos)}</span>
        </span>
      </div>
    </Card>
  );
}

type Props = {
  items: UserVocabulary[];
};

/**
 * ウィンドウスクロール連動の仮想化。行単位でグリッドを描画し、見えている行だけ DOM を保つ。
 */
export function VocabularyListVirtualGrid({ items }: Props) {
  const cols = useResponsiveColumnCount();
  const rowCount = Math.ceil(items.length / cols);
  const allIds = useMemo(() => items.map((v) => v.id), [items]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 220,
    gap: 12,
    overscan: 6,
    measureElement,
  });

  return (
    <div
      className="w-full"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const start = virtualRow.index * cols;
        const rowItems = items.slice(start, start + cols);

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="left-0 top-0 w-full"
            style={{
              position: "absolute",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((v, i) => (
                <VocabularyGridCard key={v.id} vocabulary={v} paletteIndex={start + i} allIds={allIds} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
