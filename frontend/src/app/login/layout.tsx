import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ログイン",
  description: "登録済みアカウントで Korean TOPIK App にログインし、ブックマークなど会員機能を利用します。",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
