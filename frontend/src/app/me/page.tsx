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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <Card className="w-full max-w-md">
          <h1 className="text-xl font-semibold text-zinc-900">未ログイン</h1>
          <p className="mt-2 text-sm text-zinc-600">
            続けるには{" "}
            <Link className="font-medium underline" href="/login">
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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="text-sm text-zinc-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-zinc-900">プロフィール</h1>
        <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <dt className="text-zinc-500">ID</dt>
          <dd className="col-span-2 break-all text-zinc-900">{state.user.id}</dd>
          <dt className="text-zinc-500">名前</dt>
          <dd className="col-span-2 text-zinc-900">{state.user.name}</dd>
          <dt className="text-zinc-500">メール</dt>
          <dd className="col-span-2 text-zinc-900">{state.user.email}</dd>
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

