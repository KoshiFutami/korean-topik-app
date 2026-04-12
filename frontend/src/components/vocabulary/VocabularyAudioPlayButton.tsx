"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ensureAdminVocabularyAudio, ensureAdminVocabularyExampleAudio } from "@/lib/api/admin/vocabularies";
import { ApiError } from "@/lib/api/http";
import { ensureVocabularyAudio, ensureVocabularyExampleAudio } from "@/lib/api/vocabularies";

type AudioScope = "term" | "example";

type Props = {
  vocabularyId: string;
  /** 見出し語（既定） / 例文 */
  scope?: AudioScope;
  /** 一覧・詳細 API が既に返している URL（あれば初回から再生、なければ初回クリックで ensure） */
  initialAudioUrl?: string | null;
  /** 設定時は管理用 POST（下書き語彙の音声も生成可） */
  adminToken?: string | null;
  /** ensure で URL が得られたとき（詳細ページのインライン audio 表示など） */
  onAudioUrlResolved?: (url: string) => void;
  className?: string;
  /** グラデーションカード上（デフォルト） / 管理画面の明るい背景 */
  tone?: "glass" | "zinc";
  /**
   * 親が button のとき true（クイズのめくりカードなど）。button の入れ子を避け span+role を使う。
   */
  avoidNestedButton?: boolean;
};

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .89 1.02 1.39 1.71.83l9.93-6.86a1 1 0 0 0 0-1.66L9.71 4.31A.998.998 0 0 0 8 5.14Z" />
    </svg>
  );
}

function StopGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function SpinnerGlyph({ className }: { className?: string }) {
  return (
    <svg className={["animate-spin", className ?? ""].join(" ")} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * 一覧カード用のコンパクト再生操作（親の Link 遷移を阻害しない）。
 * 音声 URL が未生成でも常に表示し、初回再生時に ensure API で取得して以降は state にキャッシュする。
 */
export function VocabularyAudioPlayButton({
  vocabularyId,
  scope = "term",
  initialAudioUrl,
  adminToken,
  onAudioUrlResolved,
  className,
  tone = "glass",
  avoidNestedButton,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const onResolvedRef = useRef(onAudioUrlResolved);
  onResolvedRef.current = onAudioUrlResolved;
  const ensurePendingRef = useRef<Promise<string | null> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string | null>(() => initialAudioUrl ?? null);
  const [ensuring, setEnsuring] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const serverAudioUrl = initialAudioUrl ?? null;

  /**
   * 別の語彙へ遷移したときだけサーバー初期値に戻す。
   * serverAudioUrl を依存に含めない（含めると null のたびに ensure 済み URL が消えて POST が連発する）。
   */
  useEffect(() => {
    setFetchError(null);
    ensurePendingRef.current = null;
    loadedUrlRef.current = null;
    setCachedUrl(serverAudioUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- リセットは語彙 ID と音声の対象のみ
  }, [vocabularyId, scope]);

  useEffect(() => {
    if (serverAudioUrl) {
      setCachedUrl(serverAudioUrl);
    }
  }, [serverAudioUrl]);

  const resolveUrl = useCallback(async (): Promise<string | null> => {
    if (cachedUrl) return cachedUrl;
    if (!ensurePendingRef.current) {
      ensurePendingRef.current = (async () => {
        setEnsuring(true);
        setFetchError(null);
        try {
          const url =
            scope === "example"
              ? adminToken
                ? (await ensureAdminVocabularyExampleAudio(adminToken, vocabularyId)).example_audio_url
                : (await ensureVocabularyExampleAudio(vocabularyId)).example_audio_url
              : adminToken
                ? (await ensureAdminVocabularyAudio(adminToken, vocabularyId)).audio_url
                : (await ensureVocabularyAudio(vocabularyId)).audio_url;
          setCachedUrl(url);
          onResolvedRef.current?.(url);
          return url;
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : "音声の取得に失敗しました。しばらくしてから再度お試しください。";
          setFetchError(msg);
          return null;
        } finally {
          setEnsuring(false);
        }
      })().finally(() => {
        ensurePendingRef.current = null;
      });
    }
    return ensurePendingRef.current;
  }, [adminToken, cachedUrl, scope, vocabularyId]);

  const activate = useCallback(
    async (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = audioRef.current;
      if (!el || ensuring) return;

      if (!el.paused) {
        el.pause();
        el.currentTime = 0;
        setPlaying(false);
        return;
      }

      const url = cachedUrl ?? (await resolveUrl());
      if (!url) return;

      if (loadedUrlRef.current !== url) {
        el.src = url;
        el.load();
        loadedUrlRef.current = url;
      }
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    },
    [cachedUrl, ensuring, resolveUrl],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        void activate(e);
      }
    },
    [activate],
  );

  const toneClass =
    tone === "zinc"
      ? playing
        ? "bg-zinc-300 text-zinc-900 ring-zinc-400"
        : "bg-zinc-100 text-zinc-800 ring-zinc-300 hover:bg-zinc-200"
      : playing
        ? "bg-white/25 text-white ring-white/40"
        : "bg-white/15 text-white ring-white/30 hover:bg-white/25";

  const styleClass = [
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-2.5 py-1.5 text-sm font-semibold",
    "ring-1 transition-colors",
    ensuring ? "cursor-wait opacity-80" : "",
    toneClass,
    className ?? "",
  ].join(" ");

  const isExample = scope === "example";
  const titleBase = playing
    ? "停止"
    : cachedUrl
      ? "再生"
      : isExample
        ? "例文を再生（未取得の場合は生成します）"
        : "再生（未取得の場合は生成します）";
  const title = fetchError ? fetchError : titleBase;
  const ariaPlay = isExample ? "例文の韓国語を再生" : "韓国語の発音を再生";
  const ariaStop = isExample ? "例文の再生を停止" : "再生を停止";
  const labelShort = ensuring ? "準備中" : playing ? "停止" : isExample ? "例文" : "再生";

  const iconClass = "h-[1.1rem] w-[1.1rem] shrink-0";

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      {avoidNestedButton ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => void activate(e)}
          onKeyDown={onKeyDown}
          aria-label={playing ? ariaStop : ariaPlay}
          aria-busy={ensuring}
          title={title}
          className={styleClass}
        >
          <span aria-hidden className="inline-flex items-center justify-center leading-none">
            {ensuring ? <SpinnerGlyph className={iconClass} /> : playing ? <StopGlyph className={iconClass} /> : <PlayGlyph className={iconClass} />}
          </span>
          <span className="ml-1 hidden text-xs sm:inline">{labelShort}</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => void activate(e)}
          disabled={ensuring}
          aria-label={playing ? ariaStop : ariaPlay}
          aria-busy={ensuring}
          title={title}
          className={styleClass}
        >
          <span aria-hidden className="inline-flex items-center justify-center leading-none">
            {ensuring ? <SpinnerGlyph className={iconClass} /> : playing ? <StopGlyph className={iconClass} /> : <PlayGlyph className={iconClass} />}
          </span>
          <span className="ml-1 hidden text-xs sm:inline">{labelShort}</span>
        </button>
      )}
    </>
  );
}
