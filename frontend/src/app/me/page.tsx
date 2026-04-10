"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function MePage() {
  const { state, logout, refreshMe } = useAuth();

  useEffect(() => {
    if (state.status === "guest") return;
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  if (state.status === "guest") {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
        <Card className="w-full max-w-md border-white/10 bg-white/10 text-white backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            未ログイン
            <span className="ml-2 align-baseline text-base font-semibold text-white/85">
              로그인 필요
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/80">
            続けるには{" "}
            <Link className="font-semibold underline" href="/login">
              ログイン
            </Link>
            してください。
          </p>
        </Card>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
        <div className="text-sm text-white/80">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
      <Card className="w-full max-w-md border-white/10 bg-white/10 text-white backdrop-blur">
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
          プロフィール
          <span className="ml-2 align-baseline text-lg font-semibold text-white/85">프로필</span>
        </h1>
        <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <dt className="text-white/70">ID</dt>
          <dd className="col-span-2 break-all text-white">{state.user.id}</dd>
          <dt className="text-white/70">名前</dt>
          <dd className="col-span-2 text-white">{state.user.name}</dd>
          <dt className="text-white/70">メール</dt>
          <dd className="col-span-2 text-white">{state.user.email}</dd>
        </dl>

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" type="button" onClick={() => refreshMe()}>
            更新
          </Button>
          <Button type="button" onClick={() => logout()}>
            ログアウト
          </Button>
        </div>
      </Card>
    </div>
  );
}

