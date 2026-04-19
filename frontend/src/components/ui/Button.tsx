import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-[linear-gradient(135deg,#6366f1,#3b82f6)] text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:opacity-90 hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)]",
    secondary:
      "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
    ghost:
      "bg-[rgba(255,255,255,0.05)] text-[#BCC0E8] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F0F0FF]",
    danger:
      "bg-[rgba(244,63,94,0.12)] text-[#fb7185] border border-[rgba(244,63,94,0.25)] hover:bg-[rgba(244,63,94,0.2)]",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
