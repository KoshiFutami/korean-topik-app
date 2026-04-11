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
    : "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm";

  return (
    <div className={`${base} ${className}`}>
      {children}
    </div>
  );
}

