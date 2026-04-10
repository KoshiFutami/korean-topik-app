# Agent ルーティングガイド

## リポジトリ構成

```
korean-topik-app/
├── backend/          # Laravel アプリケーション
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── tests/
├── frontend/         # Next.js アプリケーション
│   ├── src/
│   │   ├── app/      # App Router
│   │   ├── components/
│   │   └── lib/
│   └── tests/
├── docs/adr/         # アーキテクチャ決定記録
├── .claude/          # Claude 設定・フック
├── .cursor/          # Cursor 設定
└── docker-compose.yml
```

## どのファイルを触るか

| タスク | 対象ディレクトリ |
|--------|----------------|
| API エンドポイント追加 | `backend/app/Http/Controllers/`, `backend/routes/api.php` |
| DB スキーマ変更 | `backend/database/migrations/` |
| ビジネスロジック | `backend/app/Services/` |
| フロントページ追加 | `frontend/src/app/` |
| 共通コンポーネント | `frontend/src/components/` |
| API クライアント | `frontend/src/lib/api/` |

## よく使うコマンド

| タスク | コマンド |
|--------|---------|
| 全サービス起動 | `make up` |
| ログ確認 | `make logs` |
| テスト実行 | `make test` |
| PHP lint チェック | `make lint-backend` |
| PHP lint 修正 | `make lint-backend-fix` |
| マイグレーション | `make migrate` |
| バックエンド shell | `make bash-backend` |
| フロントエンド shell | `make bash-frontend` |
| DB shell | `make bash-db` |

## 開発フロー

1. `make up` でローカル環境を起動
2. **機能ごとにブランチを作成**してから作業を開始する（下記「ブランチ運用」参照）
3. 変更前に ADR を確認（大きな変更は Plan Mode で設計）
4. 実装 → `make lint-backend` → `make test`
5. テストが通ったら `make push` → `make pr` で PR を作成

### API 変更時のルール

- **API を追加・変更したら Postman コレクションも必ず更新する**: `postman/korean-topik-app.postman_collection.json`

## ブランチ運用

### ブランチ構成

```
main
└── release/v<x.y>        # リリース単位の統合ブランチ
    ├── feat/<内容>        # 機能追加
    ├── fix/<内容>         # バグ修正
    └── chore/<内容>       # 雑務・設定
```

- **`main`** — 本番リリース済みのコードのみ。直接コミット禁止
- **`release/v<x.y>`** — リリース単位の統合ブランチ。feature ブランチの PR マージ先
- **`feat/` 等** — 1 機能・1 修正ごとに `release/` から切る

### 典型的な流れ

```bash
# 1. リリースブランチを作成（まだなければ）
git switch main
git switch -c release/v0.1

# 2. feature ブランチをリリースブランチから切る
git switch -c feat/vocabulary-api

# 3. 実装 → lint → test
make lint-backend
make test

# 4. PR を release/v0.1 向けに作成
make push
gh pr create --base release/v0.1 --fill

# 5. リリース時: release → main の PR を作成
gh pr create --base main --head release/v0.1 --title "release: v0.1"
```

### ブランチ命名規則

| 種類 | パターン | 例 |
|------|---------|-----|
| リリース | `release/v<x.y>` | `release/v0.1` |
| 機能追加 | `feat/<内容>` | `feat/vocabulary-api` |
| バグ修正 | `fix/<内容>` | `fix/auth-token-expiry` |
| リファクタ | `refactor/<内容>` | `refactor/vocabulary-service` |
| ドキュメント | `docs/<内容>` | `docs/api-readme` |
| 雑務・設定 | `chore/<内容>` | `chore/update-dependencies` |

## API 設計規約

- ベース URL: `/api/v1/`
- 認証: Laravel Sanctum (Bearer トークン)
- レスポンス形式: JSON
- フロントエンドの API URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`

## 保護されたファイル（変更禁止）

以下のファイルはフックで保護されており、AIエージェントによる変更はブロックされます：

- `.claude/settings.json`
- `.claude/hooks/pre-protect-config.sh`
- `.claude/hooks/post-pint.sh`
- `backend/pint.json`
- `backend/phpunit.xml`
- `.github/workflows/backend-pint.yml`
