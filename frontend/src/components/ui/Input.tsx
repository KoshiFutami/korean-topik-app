"use client";

import React, { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  tone?: "light" | "dark";
  labelSuffix?: string;
};

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function Input({
  label,
  labelSuffix,
  error,
  tone = "light",
  className = "",
  ...props
}: Props) {
  const isPassword = props.type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const labelCls =
    tone === "dark" ? "text-white/90" : "text-zinc-800";
  const inputBase =
    "h-10 rounded-md border px-3 text-sm outline-none focus:ring-2";
  const inputTone =
    tone === "dark"
      ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-white/20"
      : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-zinc-900/20";
  const inputErr =
    tone === "dark" ? "border-red-300/80" : "border-red-400";
  const toggleBtnCls =
    tone === "dark"
      ? "text-white/60 hover:text-white/90"
      : "text-zinc-400 hover:text-zinc-700";

  const inputType = isPassword ? (showPassword ? "text" : "password") : props.type;

  return (
    <label className="flex flex-col gap-1">
      <span className={`text-sm font-medium ${labelCls}`}>
        {label}
        {labelSuffix ? (
          <span className="ml-2 align-baseline text-xs font-semibold opacity-80">
            {labelSuffix}
          </span>
        ) : null}
      </span>
      {isPassword ? (
        <div className="relative">
          <input
            className={`${inputBase} ${inputTone} ${error ? inputErr : ""} w-full pr-10 ${className}`}
            {...props}
            type={inputType}
          />
          <button
            type="button"
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
            className={`absolute inset-y-0 right-0 flex items-center px-3 ${toggleBtnCls} focus:outline-none`}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : (
        <input
          className={`${inputBase} ${inputTone} ${error ? inputErr : ""} ${className}`}
          {...props}
        />
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

