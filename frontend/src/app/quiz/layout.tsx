import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "フラッシュカード",
  description:
    "韓国語と日本語を選んでランダム出題。カードをめくり、「わかった」「わからない」で反復練習。ブックマーク語彙だけのモードも利用できます。",
};

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children;
}
