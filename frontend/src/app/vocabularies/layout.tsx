import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "語彙一覧",
  description:
    "TOPIK 1〜6級の韓国語語彙をレベル・品詞・種別で絞り込み。意味・品詞情報から一覧で学習を始められます。",
};

export default function VocabulariesLayout({ children }: { children: ReactNode }) {
  return children;
}
