"use client";

type Props = {
  src: string;
  className?: string;
};

/**
 * 語彙の MP3（API が返す絶対 URL）をブラウザ標準の audio で再生する。
 */
export function VocabularyInlineAudio({ src, className }: Props) {
  return (
    <div className={className}>
      <audio className="h-9 w-full max-w-md" controls preload="none" src={src}>
        お使いのブラウザは音声再生に対応していません。
      </audio>
    </div>
  );
}
