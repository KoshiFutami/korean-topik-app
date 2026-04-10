"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

function NavLink({
  href,
  label,
  tone = "light",
}: {
  href: string;
  label: string;
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [href, pathname]);

  const base = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const cls =
    tone === "dark"
      ? isActive
        ? `${base} bg-white text-zinc-900`
        : `${base} text-white/90 hover:bg-white/10`
      : isActive
        ? `${base} bg-zinc-900 text-white`
        : `${base} text-zinc-700 hover:bg-zinc-100`;

  return (
    <Link className={cls} href={href}>
      {label}
    </Link>
  );
}

export function AppHeader() {
  const { state, logout } = useAuth();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isLearnerGlass =
    pathname?.startsWith("/vocabularies") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/me";
  const tone: "light" | "dark" = isLearnerGlass ? "dark" : "light";

  return (
    <header
      className={
        isLearnerGlass
          ? [
              "sticky top-0 z-20",
              "border-b border-white/10",
              "bg-gradient-to-r from-sky-700/70 via-teal-600/60 to-cyan-700/70",
              "backdrop-blur",
            ].join(" ")
          : "border-b border-zinc-200 bg-white"
      }
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={
              isLearnerGlass
                ? "text-sm font-semibold text-white drop-shadow-sm"
                : "text-sm font-semibold text-zinc-900"
            }
          >
            Korean TOPIK App
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/vocabularies" label="語彙" tone={tone} />
            <NavLink href="/me" label="プロフィール" tone={tone} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {state.status === "authed" ? (
            <>
              <div
                className={
                  isLearnerGlass
                    ? "hidden text-sm text-white/80 sm:block"
                    : "hidden text-sm text-zinc-600 sm:block"
                }
              >
                {state.user.name}
              </div>
              <Button variant="secondary" type="button" onClick={() => logout()}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link
                className={
                  isLearnerGlass
                    ? "rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                    : "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                }
                href="/login"
              >
                ログイン
              </Link>
              <Link
                className={
                  isLearnerGlass
                    ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white/90"
                    : "rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                }
                href="/register"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-3 sm:hidden">
        <nav className="flex items-center gap-1">
          <NavLink href="/vocabularies" label="語彙" tone={tone} />
          <NavLink href="/me" label="プロフィール" tone={tone} />
        </nav>
      </div>
    </header>
  );
}

