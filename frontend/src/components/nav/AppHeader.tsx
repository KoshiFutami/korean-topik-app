"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [href, pathname]);

  const base =
    "rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const cls = isActive
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

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-zinc-900">
            Korean TOPIK App
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/vocabularies" label="語彙" />
            <NavLink href="/me" label="プロフィール" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {state.status === "authed" ? (
            <>
              <div className="hidden text-sm text-zinc-600 sm:block">
                {state.user.name}
              </div>
              <Button variant="secondary" type="button" onClick={() => logout()}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/login"
              >
                ログイン
              </Link>
              <Link
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
          <NavLink href="/vocabularies" label="語彙" />
          <NavLink href="/me" label="プロフィール" />
        </nav>
      </div>
    </header>
  );
}

