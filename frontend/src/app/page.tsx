import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Korean TOPIK App</h1>
        <p className="mt-2 text-sm text-zinc-600">
          認証フロー（User）を確認できます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            href="/login"
          >
            ログイン
          </Link>
          <Link
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            href="/register"
          >
            新規登録
          </Link>
          <Link
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            href="/me"
          >
            プロフィール
          </Link>
          <Link
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            href="/vocabularies"
          >
            語彙
          </Link>
        </div>
      </div>
    </div>
  );
}
