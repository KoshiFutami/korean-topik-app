"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ApiError } from "@/lib/api/http";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function firstError(err: unknown): { message: string; fieldErrors?: Record<string, string> } {
  if (!(err instanceof ApiError)) return { message: "登録に失敗しました。" };
  const body = err.body;
  const fieldErrors: Record<string, string> = {};
  if (body?.errors) {
    for (const [k, msgs] of Object.entries(body.errors)) {
      fieldErrors[k] = msgs?.[0] ?? "";
    }
  }
  return { message: err.message, fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined };
}

export default function RegisterPage() {
  const { register, state } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (state.status === "loading") return false;
    return true;
  }, [submitting, state.status]);

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-10 text-white">
      <Card className="w-full max-w-md border-white/10 bg-white/10 text-white backdrop-blur">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            新規登録
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">가입</span>
          </h1>
          <p className="text-sm text-white/80">
            すでにアカウントをお持ちの場合は{" "}
            <Link className="font-semibold underline" href="/login">
              ログイン
            </Link>
            へ。
          </p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setFieldErrors({});
            setSubmitting(true);
            try {
              await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
              });
            } catch (err) {
              const parsed = firstError(err);
              setError(parsed.message);
              setFieldErrors(parsed.fieldErrors ?? {});
              setSubmitting(false);
            }
          }}
        >
          <Input
            label="名前"
            labelSuffix="이름"
            tone="dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={fieldErrors.name}
          />
          <Input
            label="メールアドレス"
            labelSuffix="이메일"
            tone="dark"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={fieldErrors.email}
          />
          <Input
            label="パスワード"
            labelSuffix="비밀번호"
            tone="dark"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={fieldErrors.password}
          />
          <Input
            label="パスワード（確認）"
            labelSuffix="확인"
            tone="dark"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          {error ? <div className="text-sm font-medium text-red-200">{error}</div> : null}

          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "送信中..." : "登録"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

