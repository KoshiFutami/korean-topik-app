import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { listPublishedPlannedFeatures, type PlannedFeature } from "@/lib/api/planned-features";

export const metadata: Metadata = {
  title: { absolute: "Korean TOPIK App — 語彙とクイズで、今日の一歩" },
  description:
    "TOPIK レベル別の語彙を検索し、フラッシュカードで反復練習。ブックマークで自分だけの教材をつくれます。近日公開予定の機能もチェック。",
};

function FeatureCard({
  href,
  emoji,
  title,
  titleKo,
  children,
  cta,
  highlight,
}: {
  href: string;
  emoji: string;
  title: string;
  titleKo: string;
  children: ReactNode;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left shadow-lg transition-all duration-300",
        "border-white/15 bg-white/10 ring-1 ring-white/10 backdrop-blur-md",
        "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:shadow-xl",
        highlight ? "md:ring-2 md:ring-amber-300/40" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-80"
      />
      <span className="text-3xl drop-shadow-sm">{emoji}</span>
      <h2 className="mt-3 text-lg font-bold text-white drop-shadow-sm">
        {title}
        <span className="mt-0.5 block text-sm font-semibold text-white/75">{titleKo}</span>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">{children}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-200 group-hover:text-amber-100">
        {cta}
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}

function ComingSoonCard({ item }: { item: PlannedFeature }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-950/50 via-fuchsia-900/35 to-transparent p-5 ring-1 ring-white/10 backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950">
          Coming soon
        </span>
        <span aria-hidden className="text-xl opacity-90">
          🚀
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-white drop-shadow-sm">{item.title_ja}</h3>
      {item.subtitle_ko ? (
        <p className="mt-1 text-xs font-semibold text-fuchsia-100/85">{item.subtitle_ko}</p>
      ) : null}
      {item.summary_ja ? (
        <p className="mt-2 text-sm leading-relaxed text-white/80">{item.summary_ja}</p>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const plannedFeatures = await listPublishedPlannedFeatures();

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-gradient-to-b from-sky-700 via-teal-600 to-cyan-800 px-4 py-12 text-white sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.22),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(34,211,238,0.15),transparent)]"
      />

      <div className="relative mx-auto max-w-4xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-teal-100/90 sm:text-sm">
          TOPIK 語彙 × 毎日ちょっとずつ
        </p>
        <h1 className="mt-3 text-center text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:text-5xl md:text-6xl">
          今日の一語が、
          <br className="sm:hidden" />
          あなたの韓国語を動かす
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg font-semibold text-teal-50/95 sm:text-xl">
          오늘의 단어가 실력을 바꿔요
        </p>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-white/85 sm:text-lg">
          レベル別の語彙をめくって、覚えて、ブックマークに残す。
          <span className="font-semibold text-white">わくわくする反復</span>
          で、試験も会話も近づきます。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/vocabularies"
            emoji="📚"
            title="語彙ライブラリ"
            titleKo="단어 라이브러리"
            cta="語彙をさがす"
          >
            TOPIK 1〜6級・品詞で絞り込み。意味・例文と一緒に、頭に入る順で学べます。
          </FeatureCard>
          <FeatureCard
            href="/quiz"
            emoji="✨"
            title="フラッシュカード"
            titleKo="플래시카드"
            cta="いまクイズを始める"
            highlight
          >
            韓国語⇄日本語を選んでランダム出題。めくって「わかった！」の瞬間が気持ちいい。
          </FeatureCard>
          <FeatureCard
            href="/bookmarks"
            emoji="🔖"
            title="ブックマーク"
            titleKo="북마크"
            cta="保存リストを見る"
          >
            気になる語だけ集めて集中復習。会員登録で、自分専用の教材棚がひらきます。
          </FeatureCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/topik-practice"
            emoji="📝"
            title="TOPIK 問題練習"
            titleKo="토픽 문제 연습"
            cta="問題を解いてみる"
          >
            文法の空欄補充問題（TOPIK 1 の31〜37番形式）を1問ずつ解いて答えを確認できます。
          </FeatureCard>
        </div>

        {plannedFeatures.length > 0 ? (
          <section className="mt-14" aria-labelledby="coming-soon-heading">
            <div className="text-center">
              <h2
                id="coming-soon-heading"
                className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl"
              >
                近日公開
                <span className="mt-1 block text-base font-semibold text-violet-100/90 sm:text-lg">
                  곧 만나요 · Coming soon
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                開発チームが準備中の機能です。リリース順は変更になる場合がありますが、
                <span className="font-medium text-white">どれも「もっと学びたくなる」方向</span>
                に仕上げていきます。今のうちに会員登録してお待ちください。
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plannedFeatures.map((item) => (
                <ComingSoonCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/vocabularies"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-bold text-teal-800 shadow-lg transition hover:bg-teal-50 hover:shadow-xl sm:w-auto"
          >
            はじめてみる
          </Link>
          <Link
            href="/quiz"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl border-2 border-white/50 bg-white/15 px-6 py-3 text-base font-bold text-white backdrop-blur-sm transition hover:border-white/80 hover:bg-white/25 sm:w-auto"
          >
            フラッシュカードへ
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          はじめての方は{" "}
          <Link href="/register" className="font-semibold text-amber-200 underline decoration-amber-200/60 underline-offset-2 hover:text-amber-100">
            無料の会員登録
          </Link>
          {" · "}
          <Link href="/login" className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:text-teal-50">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
