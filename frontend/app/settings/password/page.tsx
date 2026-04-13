"use client";

import { useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 呼び出し
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          パスワード変更
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="current_password"
            name="current_password"
            label="現在のパスワード"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="現在のパスワードを入力"
          />
          <PasswordInput
            id="new_password"
            name="new_password"
            label="新しいパスワード"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="8文字以上で入力"
          />
          <PasswordInput
            id="new_password_confirmation"
            name="new_password_confirmation"
            label="新しいパスワード（確認）"
            value={newPasswordConfirmation}
            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="もう一度入力してください"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            パスワードを変更する
          </button>
        </form>
      </div>
    </div>
  );
}
