"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        ? `${base} bg-white/10 text-[#818cf8] border border-[rgba(99,102,241,0.3)]`
        : `${base} text-[#BCC0E8] hover:bg-white/8 hover:text-[#F0F0FF]`
      : isActive
        ? `${base} bg-zinc-900 text-white`
        : `${base} text-zinc-700 hover:bg-zinc-100`;

  return (
    <Link className={cls} href={href}>
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  icon,
  tone = "light",
}: {
  href: string;
  label: string;
  icon: ReactNode;
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [href, pathname]);

  const base = "flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors";
  const cls =
    tone === "dark"
      ? isActive
        ? `${base} bg-[rgba(99,102,241,0.15)] text-[#818cf8]`
        : `${base} text-[#9499C4] hover:bg-white/8 hover:text-[#BCC0E8]`
      : isActive
        ? `${base} bg-zinc-900 text-white`
        : `${base} text-zinc-700 hover:bg-zinc-100`;

  return (
    <Link className={cls} href={href}>
      <span className="h-5 w-5">{icon}</span>
      <span>{label}</span>
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
    pathname === null ||
    pathname === "/" ||
    pathname.startsWith("/vocabularies") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/quiz") ||
    pathname.startsWith("/topik-practice") ||
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
              "border-b border-white/[0.06]",
              "bg-[rgba(8,9,26,0.85)]",
              "backdrop-blur-xl",
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
                ? "text-sm font-bold bg-[linear-gradient(135deg,#6366f1,#3b82f6)] bg-clip-text text-transparent"
                : "text-sm font-semibold text-zinc-900"
            }
          >
            Korean TOPIK
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/vocabularies" label="語彙" tone={tone} />
            <NavLink href="/quiz" label="クイズ" tone={tone} />
            <NavLink href="/topik-practice" label="TOPIK問題" tone={tone} />
            <NavLink href="/bookmarks" label="ブックマーク" tone={tone} />
            <NavLink href="/me" label="プロフィール" tone={tone} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {state.status === "authed" ? (
            <>
              <Link href="/me" aria-label="プロフィール" className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]">
                {state.user.profile_image_url ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[rgba(99,102,241,0.5)]">
                    <Image
                      src={state.user.profile_image_url}
                      alt="プロフィール画像"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-[rgba(99,102,241,0.5)]"
                    style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)" }}
                  >
                    {(state.user.nickname ?? state.user.name)?.[0] ?? "U"}
                  </div>
                )}
                <span
                  className={
                    isLearnerGlass
                      ? "hidden text-sm text-[#9499C4] sm:block"
                      : "hidden text-sm text-zinc-600 sm:block"
                  }
                >
                  {state.user.nickname ?? state.user.name}
                </span>
              </Link>
              <Button variant={isLearnerGlass ? "ghost" : "secondary"} type="button" onClick={() => logout()}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link
                className={
                  isLearnerGlass
                    ? "rounded-md px-3 py-2 text-sm font-medium text-[#BCC0E8] hover:bg-white/8 hover:text-[#F0F0FF]"
                    : "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                }
                href="/login"
              >
                ログイン
              </Link>
              <Link
                className={
                  isLearnerGlass
                    ? "rounded-md bg-[linear-gradient(135deg,#6366f1,#3b82f6)] px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:opacity-90"
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

      <div className="mx-auto w-full max-w-5xl px-4 pb-2 sm:hidden">
        <nav className="flex items-center justify-around gap-1">
          <MobileNavLink
            href="/vocabularies"
            label="語彙"
            tone={tone}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9 4.804A7.968 7.968 0 0 0 5.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 1 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 1 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
              </svg>
            }
          />
          <MobileNavLink
            href="/quiz"
            label="クイズ"
            tone={tone}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M11 17a1 1 0 0 0 1-1h-2a1 1 0 0 0 1 1zm4-5H5a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2zM5.5 10h9a1.5 1.5 0 0 0 0-3H14v-.5a4 4 0 0 0-8 0V7h-.5a1.5 1.5 0 0 0 0 3z" />
              </svg>
            }
          />
          <MobileNavLink
            href="/topik-practice"
            label="TOPIK"
            tone={tone}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h4a1 1 0 0 1 0 2H4v10h10v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" clipRule="evenodd" />
              </svg>
            }
          />
          <MobileNavLink
            href="/bookmarks"
            label="ブックマーク"
            tone={tone}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 18V4z" />
              </svg>
            }
          />
          <MobileNavLink
            href="/me"
            label="プロフィール"
            tone={tone}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clipRule="evenodd" />
              </svg>
            }
          />
        </nav>
      </div>
    </header>
  );
}
