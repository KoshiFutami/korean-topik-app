import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <input
        className={`h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 ${error ? "border-red-400" : "border-zinc-200"} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

