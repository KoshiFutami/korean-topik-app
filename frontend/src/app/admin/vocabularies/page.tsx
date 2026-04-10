"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/http";
import { logoutAdmin, meAdmin } from "@/lib/api/admin/auth";
import { listAdminVocabularies, type AdminVocabulary } from "@/lib/api/admin/vocabularies";

const ADMIN_TOKEN_KEY = "topik.admin.token";

export default function AdminVocabulariesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [items, setItems] = useState<AdminVocabulary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent("/admin/vocabularies")}`);
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const [meRes, listRes] = await Promise.all([meAdmin(token), listAdminVocabularies(token)]);
        setAdminName(meRes.admin.name);
        setItems(listRes.vocabularies);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.replace(`/admin/login?next=${encodeURIComponent("/admin/vocabularies")}`);
          return;
        }
        if (e instanceof ApiError) setError(e.message);
        else setError("語彙の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [router, token]);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-5xl space-y-4">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">管理: 語彙</h1>
              <p className="mt-1 text-sm text-zinc-600">
                {adminName ? `ログイン中: ${adminName}` : "管理者としてログイン中"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/"
              >
                学習者画面へ
              </Link>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  if (!token) return;
                  setLoading(true);
                  logoutAdmin(token)
                    .catch(() => undefined)
                    .finally(() => {
                      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
                      router.push("/admin/login");
                    });
                }}
              >
                ログアウト
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              {loading ? "読み込み中..." : `件数: ${items?.length ?? 0}`}
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>

          <div className="mt-4 divide-y divide-zinc-200">
            {(items ?? []).map((v) => (
              <Link
                key={v.id}
                href={`/admin/vocabularies/${v.id}`}
                className="block py-3 hover:bg-zinc-50 -mx-6 px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium text-zinc-900">{v.term}</div>
                    <div className="mt-1 truncate text-sm text-zinc-600">{v.meaning_ja}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-500">
                    <div>{v.level_label_ja ?? `${v.level}級`}</div>
                    <div className="mt-1">
                      {(v.entry_type_label_ja ?? v.entry_type) + " / " + (v.pos_label_ja ?? v.pos)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {!loading && items && items.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-600">語彙がありません。</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

