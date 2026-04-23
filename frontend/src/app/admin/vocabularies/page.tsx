"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { VocabularyAudioPlayButton } from "@/components/vocabulary/VocabularyAudioPlayButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/http";
import { logoutAdmin, meAdmin } from "@/lib/api/admin/auth";
import {
  importAdminVocabulariesCsv,
  listAdminVocabularies,
  type AdminVocabulary,
} from "@/lib/api/admin/vocabularies";

const ADMIN_TOKEN_KEY = "topik.admin.token";

const LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}級` })),
];

const ENTRY_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "word", label: "単語" },
  { value: "phrase", label: "熟語" },
  { value: "idiom", label: "慣用句" },
];

const POS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "noun", label: "名詞" },
  { value: "verb", label: "動詞" },
  { value: "adj", label: "形容詞" },
  { value: "adv", label: "副詞" },
  { value: "particle", label: "助詞" },
  { value: "determiner", label: "冠形詞" },
  { value: "pronoun", label: "代名詞" },
  { value: "interjection", label: "感動詞" },
  { value: "other", label: "その他" },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "すべて" },
  { value: "published", label: "公開" },
  { value: "private", label: "非公開" },
  { value: "draft", label: "下書き" },
];

type Filters = {
  q: string;
  level: string;
  entry_type: string;
  pos: string;
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

export default function AdminVocabulariesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [items, setItems] = useState<AdminVocabulary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    level: "",
    entry_type: "",
    pos: "",
    status: "",
  });

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<{ created: number; updated: number } | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

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

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setCsvImporting(true);
    setCsvResult(null);
    setCsvError(null);
    try {
      const result = await importAdminVocabulariesCsv(token, file);
      setCsvResult(result);
      // Refresh list
      const listRes = await listAdminVocabularies(token);
      setItems(listRes.vocabularies);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 419)) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        router.replace(`/admin/login?next=${encodeURIComponent("/admin/vocabularies")}`);
        return;
      }
      if (err instanceof ApiError) setCsvError(err.message);
      else setCsvError("CSVのインポートに失敗しました。");
    } finally {
      setCsvImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const normalizedItems = useMemo(
    () =>
      items?.map((v) => ({
        ...v,
        _termLower: v.term.toLowerCase(),
        _meaningLower: v.meaning_ja.toLowerCase(),
      })) ?? null,
    [items],
  );

  const filteredItems = useMemo(() => {
    if (!normalizedItems) return null;
    const q = filters.q.trim().toLowerCase();
    return normalizedItems.filter((v) => {
      if (q && !v._termLower.includes(q) && !v._meaningLower.includes(q)) return false;
      if (filters.level && String(v.level) !== filters.level) return false;
      if (filters.entry_type && v.entry_type !== filters.entry_type) return false;
      if (filters.pos && v.pos !== filters.pos) return false;
      if (filters.status && v.status !== filters.status) return false;
      return true;
    });
  }, [normalizedItems, filters]);

  const toggleFilter = (key: keyof Filters, value: string) =>
    setFilters((p) => ({ ...p, [key]: p[key] === value ? "" : value }));

  const isFiltered =
    filters.q.trim() !== "" ||
    filters.level !== "" ||
    filters.entry_type !== "" ||
    filters.pos !== "" ||
    filters.status !== "";

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
                href="/admin/questions"
              >
                問題管理へ
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
                href="/admin/vocabularies/new"
              >
                新規登録
              </Link>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleCsvImport}
                  disabled={csvImporting}
                />
                {csvImporting ? "インポート中..." : "CSV一括登録"}
              </label>
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

        {(csvResult || csvError) && (
          <Card>
            {csvResult && (
              <p className="text-sm text-green-700">
                インポート完了: 新規登録 {csvResult.created} 件、更新 {csvResult.updated} 件
              </p>
            )}
            {csvError && <p className="text-sm text-red-600">{csvError}</p>}
          </Card>
        )}

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-700">絞り込み</div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ q: "", level: "", entry_type: "", pos: "", status: "" })
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
              placeholder="例: 안녕하세요 / こんにちは"
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
                {ENTRY_TYPE_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={filters.entry_type === o.value}
                    onClick={() => toggleFilter("entry_type", o.value)}
                  >
                    {o.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-zinc-700">品詞</div>
              <div className="flex flex-wrap gap-2">
                {POS_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.value}
                    selected={filters.pos === o.value}
                    onClick={() => toggleFilter("pos", o.value)}
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
            {(filteredItems ?? []).map((v) => (
              <div
                key={v.id}
                className="flex items-start justify-between gap-4 py-3 hover:bg-zinc-50 -mx-6 px-6"
              >
                <Link href={`/admin/vocabularies/${v.id}`} className="min-w-0 flex-1">
                  <div className="truncate text-base font-medium text-zinc-900 hover:underline">
                    {v.term}
                  </div>
                  <div className="mt-1 truncate text-sm text-zinc-600">{v.meaning_ja}</div>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="text-right text-xs text-zinc-500">
                    <div>{v.level_label_ja ?? `${v.level}級`}</div>
                    <div className="mt-1">
                      {(v.entry_type_label_ja ?? v.entry_type) + " / " + (v.pos_label_ja ?? v.pos)}
                    </div>
                  </div>
                  <VocabularyAudioPlayButton
                    vocabularyId={v.id}
                    initialAudioUrl={v.audio_url}
                    adminToken={token}
                    tone="zinc"
                  />
                </div>
              </div>
            ))}

            {!loading && filteredItems && filteredItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-600">
                {isFiltered ? "条件に一致する語彙がありません。" : "語彙がありません。"}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

