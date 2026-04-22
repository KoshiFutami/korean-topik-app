"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/http";
import { compressImage } from "@/lib/compressImage";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
  const { state, logout, refreshMe, updateProfile, uploadProfileImage } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
        <div className="mx-auto w-full max-w-2xl">
          <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F0F0FF]">
              未ログイン
              <span className="ml-2 align-baseline text-base font-semibold text-[#9499C4]">
                로그인 필요
              </span>
            </h1>
            <p className="mt-2 text-sm text-[#BCC0E8]">
              続けるには{" "}
              <Link className="font-semibold text-[#818cf8] underline underline-offset-2 hover:text-[#60a5fa]" href="/login">
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
      <div className="flex flex-1 items-center justify-center bg-[#08091A] px-4 py-10 text-[#F0F0FF]">
        <div className="text-sm text-[#9499C4]">読み込み中...</div>
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
        nickname: nickname.trim() || null,
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageError(null);

    try {
      const compressed = await compressImage(file);
      await uploadProfileImage(compressed);
    } catch (err) {
      const { message } = parseApiError(err);
      setImageError(message);
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Derive initials/avatar character
  const avatarChar = (state.user.nickname ?? state.user.name)?.[0] ?? "U";
  const profileImageUrl = state.user.profile_image_url;

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden bg-[#08091A] px-4 py-8 text-[#F0F0FF]">
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none blur-[80px] bg-[rgba(99,102,241,0.12)]"
        style={{ width: 400, height: 300, top: -60, left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative mx-auto w-full max-w-2xl space-y-6">
        {/* Profile avatar */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative group">
            {profileImageUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-[0_0_32px_rgba(99,102,241,0.4)]">
                <Image
                  src={profileImageUrl}
                  alt="プロフィール画像"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-[0_0_32px_rgba(99,102,241,0.4)]"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)" }}
              >
                {avatarChar}
              </div>
            )}
            <button
              type="button"
              onClick={handleImageClick}
              disabled={imageUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label="プロフィール画像を変更"
            >
              {imageUploading ? (
                <span className="text-xs text-white">...</span>
              ) : (
                <span className="text-xs font-medium text-white">変更</span>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          {imageError && (
            <p className="text-xs text-[#fb7185]">{imageError}</p>
          )}
          <div className="text-center">
            <div className="text-xl font-bold text-[#F0F0FF]">
              {state.user.nickname ?? state.user.name}
            </div>
            <div className="text-sm text-[#9499C4]">{state.user.email}</div>
          </div>
          <div>
            <h1 className="sr-only">プロフィール</h1>
          </div>
        </div>

        {!editing ? (
          <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4">
              <h2 className="text-sm font-semibold text-[#F0F0FF]">アカウント情報 <span className="ml-1.5 text-xs font-medium text-[#9499C4]">계정 정보</span></h2>
              <Button variant="ghost" type="button" onClick={handleEdit}>編集</Button>
            </div>
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <dt className="text-[#9499C4]">ID</dt>
                <dd className="col-span-2 break-all font-mono text-[#BCC0E8] text-xs">{state.user.id}</dd>
                <dt className="text-[#9499C4]">名前</dt>
                <dd className="col-span-2 text-[#F0F0FF]">{state.user.name}</dd>
                <dt className="text-[#9499C4]">ニックネーム</dt>
                <dd className="col-span-2 text-[#F0F0FF]">
                  {state.user.nickname ? (
                    state.user.nickname
                  ) : (
                    <span className="text-[#5C6199]">未設定</span>
                  )}
                </dd>
                <dt className="text-[#9499C4]">メール</dt>
                <dd className="col-span-2 text-[#F0F0FF]">{state.user.email}</dd>
              </dl>

              {successMessage && (
                <p className="mt-4 text-sm font-medium text-[#34d399]">{successMessage}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="danger" type="button" onClick={() => logout()}>
                  ログアウト
                </Button>
              </div>
          </Card>
        ) : (
          <Card className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#F0F0FF] backdrop-blur-xl">
            <div className="mb-4 flex items-center border-b border-[rgba(255,255,255,0.06)] pb-4">
              <h2 className="text-sm font-semibold text-[#F0F0FF]">プロフィール編集 <span className="ml-1.5 text-xs font-medium text-[#9499C4]">프로필 수정</span></h2>
            </div>
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

                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <p className="mb-3 text-xs text-[#5C6199]">
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

                {error && <p className="text-sm text-[#fb7185]">{error}</p>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "保存中..." : "保存"}
                  </Button>
                  <Button variant="ghost" type="button" onClick={handleCancel}>
                    キャンセル
                  </Button>
                </div>
              </form>
          </Card>
        )}
      </div>
    </div>
  );
}
