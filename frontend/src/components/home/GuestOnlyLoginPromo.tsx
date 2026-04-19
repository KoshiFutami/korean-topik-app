"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";

export function GuestOnlyLoginPromo() {
  const { state } = useAuth();

  if (state.status === "loading" || state.status === "authed") {
    return null;
  }

  return (
    <p className="mt-8 text-center text-sm text-[#5C6199]">
      はじめての方は{" "}
      <Link
        href="/register"
        className="font-semibold text-[#818cf8] underline decoration-[rgba(129,140,248,0.6)] underline-offset-2 hover:text-[#60a5fa]"
      >
        無料の会員登録
      </Link>
      {" · "}
      <Link
        href="/login"
        className="font-semibold text-[#BCC0E8] underline decoration-[rgba(188,192,232,0.4)] underline-offset-2 hover:text-[#F0F0FF]"
      >
        ログイン
      </Link>
    </p>
  );
}
