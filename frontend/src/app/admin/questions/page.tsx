"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/http";
import { logoutAdmin, meAdmin } from "@/lib/api/admin/auth";
import {
  deleteAdminQuestion,
  listAdminQuestions,
  type AdminQuestion,
} from "@/lib/api/admin/questions";

const ADMIN_TOKEN_KEY = "topik.admin.token";

const LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}級` })),
];

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "grammar", label: "文法" },
  { value: "topic", label: "主題" },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "published", label: "公開" },
  { value: "draft", label: "下書き" },
];

type Filters = {
  q: string;
  level: string;
  question_type: string;
  status: string;
};

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
        selected
          ? "bg-zinc-900 text-white ring-zinc-900"
          : "bg-white text-zinc-700 ring-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [items, setItems] = useState<AdminQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    level: "",
    question_type: "",
    status: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent("/admin/questions")}`);
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
        const [meRes, listRes] = await Promise.all([meAdmin(token), listAdminQuestions(token)]);
        setAdminName(meRes.admin.name);
        setItems(listRes.questions);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.replace(`/admin/login?next=${encodeURIComponent("/admin/questions")}`);
          return;
        }
        if (e instanceof ApiError) setError(e.message);
        else setError("問題の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => undefined);
  }, [router, token]);

  const handleDelete = async (id: string, questionText: string) => {
    if (!token) return;
    if (!window.confirm(`「${questionText.slice(0, 30)}…」を削除しますか？`)) return;
    try {
      await deleteAdminQuestion(token, id);
      setItems((prev) => prev?.filter((q) => q.id !== id) ?? null);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        router.replace(`/admin/login?next=${encodeURIComponent("/admin/questions")}`);
        return;
      }
      if (e instanceof ApiError) setError(e.message);
      else setError("問題の削除に失敗しました。");
    }
  };

  const filteredItems = useMemo(() => {
    if (!items) return null;
    const q = filters.q.trim().toLowerCase();
    return items.filter((v) => {
      if (q && !v.question_text.toLowerCase().includes(q)) return false;
      if (filters.level && String(v.level) !== filters.level) return false;
      if (filters.question_type && v.question_type !== filters.question_type) return false;
      if (filters.status && v.status !== filters.status) return false;
      return true;
    });
  }, [items, filters]);

  const toggleFilter = (key: keyof Filters, value: string) =>
    setFilters((p) => ({ ...p, [key]: p[key] === value ? "" : value }));

  const isFiltered =
    filters.q.trim() !== "" ||
    filters.level !== "" ||
    filters.question_type !== "" ||
    filters.status !== "";

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-5xl space-y-4">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">管理: TOPIK 問題</h1>
              <p className="mt-1 text-sm text-zinc-600">
                {adminName ? `ログイン中: ${adminName}` : "管理者としてログイン中"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/admin/vocabularies"
              >
                語彙管理へ
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/admin/numbers-quiz"
              >
                数字クイズ管理へ
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/"
              >
                学習者画面へ
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800"
                href="/admin/questions/new"
              >
                新規登録
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-700">絞り込み</div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ q: "", level: "", question_type: "", status: "" })
                  }
                  className="text-sm text-zinc-500 underline hover:text-zinc-700"
                >
                  リセット
                </button>
              )}
            </div>

            <Input
              label="キーワード"
              type="search"
              placeholder="問題文で検索"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            />

            <div>
              <div className="mb-2 text-sm font-medium text-zinc-700">TOPIK レベル</div>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={filters.level === o.value}
                    onClick={() => toggleFilter("level", o.value)}
                  >
                    {o.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-zinc-700">種別</div>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={filters.question_type === o.value}
                    onClick={() => toggleFilter("question_type", o.value)}
                  >
                    {o.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-zinc-700">ステータス</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={filters.status === o.value}
                    onClick={() => toggleFilter("status", o.value)}
                  >
                    {o.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              {loading
                ? "読み込み中..."
                : isFiltered
                  ? `件数: ${filteredItems?.length ?? 0} / ${items?.length ?? 0}`
                  : `件数: ${items?.length ?? 0}`}
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>

          <div className="mt-4 divide-y divide-zinc-200">
            {(filteredItems ?? []).map((q) => (
              <div
                key={q.id}
                className="flex items-start justify-between gap-4 py-3 hover:bg-zinc-50 -mx-6 px-6"
              >
                <Link href={`/admin/questions/${q.id}`} className="min-w-0 flex-1">
                  <div className="text-base font-medium text-zinc-900 hover:underline line-clamp-2">
                    {q.question_text}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {q.level_label_ja} ／ {q.question_type_label_ja} ／ {q.status_label_ja}
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={() => { void handleDelete(q.id, q.question_text); }}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredItems && filteredItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-600">
                {isFiltered ? "条件に一致する問題がありません。" : "問題がありません。"}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
