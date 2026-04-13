"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/http";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";

function parseApiError(err: unknown): { message: string; fieldErrors?: Record<string, string> } {
  if (!(err instanceof ApiError)) return { message: "更新に失敗しました。" };
  const body = err.body;
  const fieldErrors: Record<string, string> = {};
  if (body?.errors) {
    for (const [k, msgs] of Object.entries(body.errors)) {
      fieldErrors[k] = msgs?.[0] ?? "";
    }
  }
  return {
    message: err.message,
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
  };
}

export default function MePage() {
  const { state, logout, refreshMe, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "guest") return;
    if (state.status === "loading") {
      refreshMe().catch(() => undefined);
    }
  }, [refreshMe, state.status]);

  useEffect(() => {
    if (state.status === "authed" && !editing) {
      setName(state.user.name);
      setNickname(state.user.nickname ?? "");
      setEmail(state.user.email);
    }
  }, [state, editing]);

  if (state.status === "guest") {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
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

  const handleEdit = () => {
    setName(state.user.name);
    setNickname(state.user.nickname ?? "");
    setEmail(state.user.email);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      await updateProfile({
        name,
        nickname: nickname || null,
        email,
        ...(newPassword
          ? {
              current_password: currentPassword,
              new_password: newPassword,
              new_password_confirmation: newPasswordConfirmation,
            }
          : {}),
      });
      setSuccessMessage("プロフィールを更新しました。");
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setError(message);
      if (fe) setFieldErrors(fe);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-sky-600 via-teal-500 to-cyan-700 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            プロフィール
            <span className="ml-2 align-baseline text-lg font-semibold text-white/85">프로필</span>
          </h1>
          <p className="text-sm text-white/80">アカウント情報の確認・編集ができます。</p>
        </div>

        {!editing ? (
          <Section
            title="アカウント情報"
            subtitle="계정 정보"
            headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
            titleClassName="text-white drop-shadow-sm"
            descriptionClassName="text-white/80"
            right={
              <Button variant="secondary" type="button" onClick={handleEdit}>
                編集
              </Button>
            }
          >
            <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <dt className="text-white/70">ID</dt>
                <dd className="col-span-2 break-all text-white">{state.user.id}</dd>
                <dt className="text-white/70">名前</dt>
                <dd className="col-span-2 text-white">{state.user.name}</dd>
                <dt className="text-white/70">ニックネーム</dt>
                <dd className="col-span-2 text-white">
                  {state.user.nickname ? (
                    state.user.nickname
                  ) : (
                    <span className="text-white/50">未設定</span>
                  )}
                </dd>
                <dt className="text-white/70">メール</dt>
                <dd className="col-span-2 text-white">{state.user.email}</dd>
              </dl>

              {successMessage && (
                <p className="mt-4 text-sm font-medium text-green-300">{successMessage}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={() => logout()}>
                  ログアウト
                </Button>
              </div>
            </Card>
          </Section>
        ) : (
          <Section
            title="プロフィール編集"
            subtitle="프로필 수정"
            headerClassName="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
            titleClassName="text-white drop-shadow-sm"
          >
            <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="名前"
                  labelSuffix="이름"
                  tone="dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  error={fieldErrors["name"]}
                />
                <Input
                  label="ニックネーム"
                  labelSuffix="닉네임"
                  tone="dark"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  error={fieldErrors["nickname"]}
                />
                <Input
                  label="メールアドレス"
                  labelSuffix="이메일"
                  type="email"
                  tone="dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={fieldErrors["email"]}
                />

                <div className="border-t border-white/10 pt-4">
                  <p className="mb-3 text-xs text-white/60">
                    パスワードを変更する場合のみ入力してください
                  </p>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="現在のパスワード"
                      labelSuffix="현재 비밀번호"
                      type="password"
                      tone="dark"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      error={fieldErrors["current_password"]}
                    />
                    <Input
                      label="新しいパスワード"
                      labelSuffix="새 비밀번호"
                      type="password"
                      tone="dark"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      error={fieldErrors["new_password"]}
                    />
                    <Input
                      label="新しいパスワード（確認）"
                      labelSuffix="확인"
                      type="password"
                      tone="dark"
                      value={newPasswordConfirmation}
                      onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                      autoComplete="new-password"
                      error={fieldErrors["new_password_confirmation"]}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-300">{error}</p>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "保存中..." : "保存"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleCancel}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </Card>
          </Section>
        )}
      </div>
    </div>
  );
}
