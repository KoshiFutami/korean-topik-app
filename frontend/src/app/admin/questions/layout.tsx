import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "問題管理",
  description: "TOPIK 問題データの管理用コンソール。管理者アカウントでのみアクセスできます。",
  robots: { index: false, follow: false },
};

export default function AdminQuestionsLayout({ children }: { children: ReactNode }) {
  return children;
}
