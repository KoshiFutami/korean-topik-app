---
name: korean-topik-api-check
description: korean-topik-app の API 手動確認・認証・バリデーションエラー・Sanctum の落とし穴。API 疎通や 401/403/422 の調査時に使う。
---

# korean-topik-app API 確認スキル

## 疎通の最短

```bash
# ヘルスチェック
curl -s http://localhost:8000/api/v1/health

# ログイン（トークン取得）
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 認証が必要なエンドポイント
curl -s http://localhost:8000/api/v1/vocabulary \
  -H "Authorization: Bearer <token>"
```

## 認証（Laravel Sanctum）

- ログイン後に `token` が返る。以降のリクエストは `Authorization: Bearer <token>` ヘッダーに付ける
- **401 Unauthorized** → トークンが無い・期限切れ・不正
- **403 Forbidden** → 認証済みだがそのリソースへのアクセス権がない

## よくあるエラーと原因

| ステータス | 原因 |
|-----------|------|
| 401 | Sanctum トークン未設定・期限切れ |
| 403 | ポリシー（Policy）で弾かれている |
| 404 | ルートが未定義・`php artisan route:list` で確認 |
| 405 | メソッドが違う（GET を POST で叩いている等） |
| 422 | バリデーションエラー。`errors` フィールドに詳細あり |
| 500 | サーバーエラー。`make logs` または `backend/storage/logs/laravel.log` を確認 |

## バリデーションエラーのレスポンス形式

Laravel のデフォルト（422）:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["エラーメッセージ"]
  }
}
```

## ルート確認

```bash
docker compose exec backend php artisan route:list --path=api
```

## ログ確認

```bash
make logs
# または backend ログのみ
docker compose logs -f backend
# または Laravel ログを直接確認
docker compose exec backend tail -f storage/logs/laravel.log
```

## DB 確認

```bash
make bash-db
# MySQL プロンプトで
SELECT * FROM vocabulary LIMIT 10;
```

## Empty reply / 接続エラー

- backend コンテナが落ちていないか: `docker compose ps`
- ポートが正しいか: backend は `8000`、frontend は `3000`
