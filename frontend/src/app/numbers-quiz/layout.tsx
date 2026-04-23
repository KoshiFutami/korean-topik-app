import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "数字クイズ",
  description:
    "年・月・日・時・分・ウォンの韓国語数字をフラッシュカードで練習。日本語⇄韓国語の読み方をランダム出題。音声で正しい発音も確認できます。",
};

export default function NumbersQuizLayout({ children }: { children: ReactNode }) {
  return children;
}
