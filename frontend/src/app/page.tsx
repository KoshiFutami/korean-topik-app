import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { GuestOnlyLoginPromo } from "@/components/home/GuestOnlyLoginPromo";

import { listPublishedPlannedFeatures, type PlannedFeature } from "@/lib/api/planned-features";

export const metadata: Metadata = {
  title: { absolute: "Korean TOPIK App — 語彙とクイズで、今日の一歩" },
  description:
    "TOPIK レベル別の語彙を検索し、フラッシュカードで反復練習。ブックマークで自分だけの教材をつくれます。近日公開予定の機能もチェック。",
};

function FeatureCard({
  href,
  icon,
  title,
  titleKo,
  children,
  cta,
  highlight,
}: {
  href: string;
  icon: string;
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
        "group relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300",
        highlight
          ? "border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.08)] shadow-[0_0_32px_rgba(99,102,241,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "backdrop-blur-xl",
        "hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[rgba(99,102,241,0.1)] blur-2xl transition-opacity group-hover:opacity-80"
      />
      <span className="text-3xl">{icon}</span>
      <h2 className="mt-3 text-lg font-bold text-[#F0F0FF]">
        {title}
        <span className="mt-0.5 block text-sm font-medium text-[#9499C4]">{titleKo}</span>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#BCC0E8]">{children}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#818cf8] group-hover:text-[#60a5fa]">
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
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.06)] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#818cf8]">
          Coming soon
        </span>
        <span aria-hidden className="text-xl opacity-90">
          🚀
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-[#F0F0FF]">{item.title_ja}</h3>
      {item.subtitle_ko ? (
        <p className="mt-1 text-xs font-medium text-[#818cf8]">{item.subtitle_ko}</p>
      ) : null}
      {item.summary_ja ? (
        <p className="mt-2 text-sm leading-relaxed text-[#BCC0E8]">{item.summary_ja}</p>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const plannedFeatures = await listPublishedPlannedFeatures();

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-12 text-[#F0F0FF] sm:py-16">
      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
        style={{ width: 600, height: 400, top: -100, left: "50%", transform: "translateX(-50%)" }}
      />
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(59,130,246,0.10)]"
        style={{ width: 400, height: 300, bottom: 100, right: -100 }}
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Hero */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#9499C4] sm:text-sm">
          TOPIK 語彙 × 毎日ちょっとずつ
        </p>
        <h1 className="mt-3 text-center text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-[linear-gradient(135deg,#6366f1,#3b82f6)] bg-clip-text text-transparent">今日の一語が、</span>
          <br className="sm:hidden" />
          <span className="text-[#F0F0FF]">あなたの韓国語を動かす</span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg font-semibold text-[#818cf8] sm:text-xl">
          오늘의 단어가 실력을 바꿔요
        </p>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-[#BCC0E8] sm:text-lg">
          レベル別の語彙をめくって、覚えて、ブックマークに残す。
          <span className="font-semibold text-[#F0F0FF]">わくわくする反復</span>
          で、試験も会話も近づきます。
        </p>

        {/* Feature grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/vocabularies"
            icon="📚"
            title="語彙ライブラリ"
            titleKo="단어 라이브러리"
            cta="語彙をさがす"
          >
            TOPIK 1〜6級・品詞で絞り込み。意味・例文と一緒に、頭に入る順で学べます。
          </FeatureCard>
          <FeatureCard
            href="/quiz"
            icon="✨"
            title="フラッシュカード"
            titleKo="플래시카드"
            cta="いまクイズを始める"
            highlight
          >
            韓国語⇄日本語を選んでランダム出題。めくって「わかった！」の瞬間が気持ちいい。
          </FeatureCard>
          <FeatureCard
            href="/bookmarks"
            icon="🔖"
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
            icon="📝"
            title="TOPIK 問題練習"
            titleKo="토픽 문제 연습"
            cta="問題を解いてみる"
          >
            文法の空欄補充問題（TOPIK 1 の31〜37番形式）を1問ずつ解いて答えを確認できます。
          </FeatureCard>
          <FeatureCard
            href="/numbers-learn"
            icon="🔢"
            title="数字の学習"
            titleKo="숫자 학습"
            cta="数字を学ぶ"
          >
            固有数詞・漢数詞から年月日・時分まで一覧で確認。音声ボタンで発音を聞けます。
          </FeatureCard>
          <FeatureCard
            href="/numbers-quiz"
            icon="🎯"
            title="数字クイズ"
            titleKo="숫자 퀴즈"
            cta="数字を練習する"
          >
            年・月・日・時・分・ウォンの韓国語数字をフラッシュカードで練習。音声で発音も確認。
          </FeatureCard>
        </div>

        {/* Coming soon */}
        {plannedFeatures.length > 0 ? (
          <section className="mt-14" aria-labelledby="coming-soon-heading">
            <div className="text-center">
              <h2
                id="coming-soon-heading"
                className="text-2xl font-extrabold tracking-tight text-[#F0F0FF] sm:text-3xl"
              >
                近日公開
                <span className="mt-1 block text-base font-semibold text-[#818cf8] sm:text-lg">
                  곧 만나요 · Coming soon
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#BCC0E8] sm:text-base">
                開発チームが準備中の機能です。リリース順は変更になる場合がありますが、
                <span className="font-medium text-[#F0F0FF]">どれも「もっと学びたくなる」方向</span>
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

        {/* CTA buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/vocabularies"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366f1,#3b82f6)] px-6 py-3 text-base font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition hover:opacity-90 hover:shadow-[0_4px_28px_rgba(99,102,241,0.5)] sm:w-auto"
          >
            はじめてみる
          </Link>
          <Link
            href="/quiz"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-6 py-3 text-base font-bold text-[#BCC0E8] backdrop-blur-sm transition hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF] sm:w-auto"
          >
            フラッシュカードへ
          </Link>
        </div>

        <GuestOnlyLoginPromo />
      </div>
    </div>
  );
}
