"use client";

import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, token, loading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname ?? "");
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await userApi.updateNickname(token, nickname.trim());
      await refreshUser();
      setSuccessMessage("ニックネームを更新しました！");
    } catch (err) {
      console.error("Failed to update nickname:", err);
      setError("更新に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            プロフィール
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← ホーム
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 mb-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            メールアドレス
          </p>
          <p className="text-zinc-900 dark:text-white font-medium">
            {user.email}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            ニックネームの設定
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            設定したニックネームはアプリ内のメッセージで使用されます。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <p className="text-green-600 text-sm">{successMessage}</p>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                ニックネーム
              </label>
              <input
                id="nickname"
                type="text"
                required
                maxLength={50}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例：韓国語マスター"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
              />
              <p className="text-xs text-zinc-400 mt-1">最大 50 文字</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-zinc-900 text-white py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
          </form>
        </div>

        <button
          onClick={logout}
          className="w-full mt-4 rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
