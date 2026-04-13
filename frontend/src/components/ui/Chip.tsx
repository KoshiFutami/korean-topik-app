import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ className = "", selected = false, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset";
  const styles = selected
    ? "bg-white text-zinc-900 ring-white/40"
    : "bg-white/10 text-white ring-white/25 hover:bg-white/15";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

