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

## ブランチ運用

- **`main` ブランチには直接コミットしない**
- 機能・修正・作業ごとに必ずブランチを切ってから実装を始める

### ブランチ命名規則

| 種類 | パターン | 例 |
|------|---------|-----|
| 機能追加 | `feat/<内容>` | `feat/vocabulary-api` |
| バグ修正 | `fix/<内容>` | `fix/auth-token-expiry` |
| リファクタ | `refactor/<内容>` | `refactor/vocabulary-service` |
| ドキュメント | `docs/<内容>` | `docs/api-readme` |
| 雑務・設定 | `chore/<内容>` | `chore/update-dependencies` |

### ブランチ作成コマンド

```bash
git switch -c feat/<ブランチ名>
```

作業完了後:

```bash
make push    # git push -u origin HEAD
make pr      # gh pr create --fill
```

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
