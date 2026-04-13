import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "語彙の編集",
  description: "語彙エントリの編集・保存。管理画面専用です。",
  robots: { index: false, follow: false },
};

export default function AdminVocabularyEditLayout({ children }: { children: ReactNode }) {
  return children;
}
