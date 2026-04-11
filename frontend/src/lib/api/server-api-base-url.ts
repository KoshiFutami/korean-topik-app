/**
 * Next のサーバー（RSC / Route Handler）から Laravel へ fetch するときのベース URL。
 * Docker 内では localhost がフロントコンテナ自身を指すため、API_BASE_URL で backend を指定する。
 * ローカルで `next dev` をホスト直実行する場合は未設定で NEXT_PUBLIC_API_URL にフォールバックする。
 */
export function getServerApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL?.replace(/\/$/, "") ??
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    ""
  );
}
