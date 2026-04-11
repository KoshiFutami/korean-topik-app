import { Fragment } from "react";

/** 例文中の強調範囲（単一グリーム «…» / U+2039, U+203A） */
const OPEN = "\u2039";
const CLOSE = "\u203A";

export function splitHighlightedParts(
  text: string,
): Array<{ highlighted: boolean; text: string }> {
  if (text.indexOf(OPEN) === -1) {
    return [{ highlighted: false, text }];
  }

  const parts: Array<{ highlighted: boolean; text: string }> = [];
  let i = 0;

  while (i < text.length) {
    const openAt = text.indexOf(OPEN, i);
    if (openAt === -1) {
      if (i < text.length) {
        parts.push({ highlighted: false, text: text.slice(i) });
      }
      break;
    }
    if (openAt > i) {
      parts.push({ highlighted: false, text: text.slice(i, openAt) });
    }
    const closeAt = text.indexOf(CLOSE, openAt + 1);
    if (closeAt === -1) {
      parts.push({ highlighted: false, text: text.slice(openAt) });
      break;
    }
    parts.push({
      highlighted: true,
      text: text.slice(openAt + 1, closeAt),
    });
    i = closeAt + 1;
  }

  return parts.length > 0 ? parts : [{ highlighted: false, text }];
}

export type HighlightedExampleTextProps = {
  text: string;
  /** 強調部分の見た目（未指定時はやや目立つが読みやすいデフォルト） */
  markClassName?: string;
};

const defaultMarkClass =
  "rounded-md bg-amber-400/25 px-1 py-0.5 font-semibold text-inherit ring-1 ring-amber-400/35";

export function HighlightedExampleText({
  text,
  markClassName = defaultMarkClass,
}: HighlightedExampleTextProps) {
  const segments = splitHighlightedParts(text);

  return (
    <>
      {segments.map((seg, idx) =>
        seg.highlighted ? (
          <span key={idx} className={markClassName}>
            {seg.text}
          </span>
        ) : (
          <Fragment key={idx}>{seg.text}</Fragment>
        ),
      )}
    </>
  );
}
