import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ブックマーク",
  description:
    "保存した韓国語語彙の一覧。会員登録後にブックマークへ追加した単語を確認・削除できます。",
};

export default function BookmarksLayout({ children }: { children: ReactNode }) {
  return children;
}
