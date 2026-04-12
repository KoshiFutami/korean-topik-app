import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "語彙詳細",
  description:
    "語彙の意味・品詞・TOPIK レベル・例文を表示。ブックマークに保存してあとから復習できます（会員登録が必要です）。",
};

export default function VocabularyDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
