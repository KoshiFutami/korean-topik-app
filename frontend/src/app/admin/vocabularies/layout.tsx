import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "語彙管理",
  description: "登録語彙の一覧・検索。管理画面から語彙データを確認します。",
  robots: { index: false, follow: false },
};

export default function AdminVocabulariesLayout({ children }: { children: ReactNode }) {
  return children;
}
