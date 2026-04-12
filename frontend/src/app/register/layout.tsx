import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "会員登録",
  description:
    "無料でアカウントを作成し、語彙のブックマークやブックマーク限定のフラッシュカードなど、会員向け機能を利用できます。",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
