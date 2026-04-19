import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ className = "", selected = false, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border";
  const styles = selected
    ? "bg-[rgba(99,102,241,0.15)] text-[#818cf8] border-[rgba(99,102,241,0.3)]"
    : "bg-[rgba(255,255,255,0.05)] text-[#BCC0E8] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
