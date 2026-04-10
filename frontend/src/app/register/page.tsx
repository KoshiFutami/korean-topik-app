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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">新規登録</h1>
          <p className="text-sm text-zinc-600">
            すでにアカウントをお持ちの場合は{" "}
            <Link className="font-medium underline" href="/login">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={fieldErrors.name}
          />
          <Input
            label="メールアドレス"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={fieldErrors.email}
          />
          <Input
            label="パスワード"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={fieldErrors.password}
          />
          <Input
            label="パスワード（確認）"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "送信中..." : "登録"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

