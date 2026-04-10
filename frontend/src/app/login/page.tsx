"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/lib/api/http";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const { login, state } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">ログイン</h1>
          <p className="text-sm text-zinc-600">
            アカウントをお持ちでない場合は{" "}
            <Link className="font-medium underline" href="/register">
              新規登録
            </Link>
            へ。
          </p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              await login({ email, password });
            } catch (err) {
              if (err instanceof ApiError) setError(err.message);
              else setError("ログインに失敗しました。");
              setSubmitting(false);
            }
          }}
        >
          <Input
            label="メールアドレス"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="パスワード"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button type="submit" disabled={submitting || state.status === "loading"}>
            {submitting ? "送信中..." : "ログイン"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

