import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "プロフィール",
  description: "ログイン中のアカウント情報（名前・メール）の確認とログアウト。",
};

export default function MeLayout({ children }: { children: ReactNode }) {
  return children;
}
