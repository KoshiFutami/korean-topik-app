import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ className = "", selected = false, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = selected
    ? "bg-zinc-900 text-white"
    : "bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

