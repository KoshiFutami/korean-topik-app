"use client";

import { useWindowVirtualizer, measureElement } from "@tanstack/react-virtual";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { VocabularyAudioPlayButton } from "@/components/vocabulary/VocabularyAudioPlayButton";
import type { BookmarkVocabulary } from "@/lib/api/bookmarks";

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

type CardProps = {
  vocabulary: BookmarkVocabulary;
  paletteIndex: number;
  removing: boolean;
  onRemove: (id: string) => void;
};

function BookmarkGridCard({ vocabulary: v, paletteIndex, removing, onRemove }: CardProps) {
  const palette = paletteIndex % 3;
  return (
    <Card
      className={[
        "p-5",
        "bg-gradient-to-br",
        palette === 0 ? "from-violet-700/60 via-fuchsia-600/40 to-orange-500/50" : "",
        palette === 1 ? "from-sky-500/60 via-emerald-500/40 to-lime-400/40" : "",
        palette === 2 ? "from-orange-500/70 via-rose-500/40 to-violet-700/50" : "",
        "border-white/10 text-white backdrop-blur",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/vocabularies/${v.id}`} className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold text-white hover:underline">{v.term}</div>
          <div className="mt-1 line-clamp-2 text-sm text-white/85">{v.meaning_ja}</div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right text-xs text-white/80">
            <div className="font-semibold">{v.level_label_ja}</div>
            <div className="mt-1">{v.pos_label_ja}</div>
          </div>
          <VocabularyAudioPlayButton vocabularyId={v.id} initialAudioUrl={v.audio_url} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip type="button" selected disabled>
          {v.entry_type_label_ja}
          <span className="ml-1 text-[11px] font-semibold opacity-80">{entryTypeKo(v.entry_type)}</span>
        </Chip>
        <Chip type="button" selected disabled>
          {v.pos_label_ja}
          <span className="ml-1 text-[11px] font-semibold opacity-80">{posKo(v.pos)}</span>
        </Chip>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-white/60">
          {new Date(v.bookmarked_at).toLocaleDateString("ja-JP")}
        </span>
        <Button variant="secondary" type="button" disabled={removing} onClick={() => onRemove(v.id)}>
          {removing ? "削除中..." : "削除"}
        </Button>
      </div>
    </Card>
  );
}

type Props = {
  items: BookmarkVocabulary[];
  removing: string | null;
  onRemove: (id: string) => void;
};

/**
 * ウィンドウスクロール連動の仮想化。行単位でグリッドを描画し、見えている行だけ DOM を保つ。
 */
export function BookmarkListVirtualGrid({ items, removing, onRemove }: Props) {
  const cols = useResponsiveColumnCount();
  const rowCount = Math.ceil(items.length / cols);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 240,
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
                <BookmarkGridCard
                  key={v.id}
                  vocabulary={v}
                  paletteIndex={start + i}
                  removing={removing === v.id}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
