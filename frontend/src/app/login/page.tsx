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
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
      <Card className="w-full max-w-md border-white/10 bg-white/10 text-white backdrop-blur">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            ログイン
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">로그인</span>
          </h1>
          <p className="text-sm text-white/80">
            アカウントをお持ちでない場合は{" "}
            <Link className="font-semibold underline" href="/register">
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
            labelSuffix="이메일"
            tone="dark"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="パスワード"
            labelSuffix="비밀번호"
            tone="dark"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}

          <Button type="submit" disabled={submitting || state.status === "loading"}>
            {submitting ? "送信中..." : "ログイン"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

