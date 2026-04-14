"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/http";
import { loginAdmin } from "@/lib/api/admin/auth";

const ADMIN_TOKEN_KEY = "topik.admin.token";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginSkeleton />}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="h-6 w-36 rounded bg-zinc-200" />
        <div className="mt-6 space-y-4">
          <div className="h-16 rounded bg-zinc-100" />
          <div className="h-16 rounded bg-zinc-100" />
          <div className="h-10 rounded bg-zinc-200" />
        </div>
      </Card>
    </div>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/admin/vocabularies", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) router.replace(nextPath);
  }, [nextPath, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">管理者ログイン</h1>
          <Link className="text-sm font-medium text-zinc-700 underline" href="/">
            学習者画面へ
          </Link>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            loginAdmin({ email, password })
              .then((res) => {
                window.localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
                router.push(nextPath);
              })
              .catch((e2) => {
                if (e2 instanceof ApiError) setError(e2.message);
                else setError("ログインに失敗しました。");
              })
              .finally(() => setLoading(false));
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-800">メールアドレス</span>
            <input
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <Input
            label="パスワード"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

