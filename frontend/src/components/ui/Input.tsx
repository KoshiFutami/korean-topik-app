import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  tone?: "light" | "dark";
  labelSuffix?: string;
};

export function Input({
  label,
  labelSuffix,
  error,
  tone = "light",
  className = "",
  ...props
}: Props) {
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
      <input
        className={`${inputBase} ${inputTone} ${error ? inputErr : ""} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

