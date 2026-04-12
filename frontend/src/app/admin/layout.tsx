import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "管理",
  description: "語彙データの管理用コンソール。管理者アカウントでのみアクセスできます。",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
