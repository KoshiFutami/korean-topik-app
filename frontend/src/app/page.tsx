"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  const displayName = user?.nickname ?? user?.name ?? null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <main className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Korean TOPIK App
        </h1>

        {user ? (
          <div className="space-y-4">
            <p className="text-xl text-zinc-700 dark:text-zinc-300">
              ようこそ、
              <span className="font-semibold text-zinc-900 dark:text-white">
                {displayName}
              </span>{" "}
              さん！
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              韓国語 TOPIK の学習を始めましょう 🇰🇷
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link
                href="/profile"
                className="inline-block rounded-full bg-zinc-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                プロフィール
              </Link>
              <button
                onClick={logout}
                className="inline-block rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              ログインまたはアカウントを作成して学習を始めましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link
                href="/login"
                className="inline-block rounded-full bg-zinc-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                新規登録
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
