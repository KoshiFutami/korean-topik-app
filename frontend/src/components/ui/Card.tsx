import React from "react";

function hasBackgroundUtility(className: string): boolean {
  return /\bbg-/.test(className);
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const base = hasBackgroundUtility(className)
    ? "rounded-xl border p-6 shadow-sm"
    : "rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

  return (
    <div className={`${base} ${className}`}>
      {children}
    </div>
  );
}
