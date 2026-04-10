# Korean TOPIK App

韓国語能力試験 (TOPIK) 学習用 Web アプリケーション

## スタック

| | 技術 |
|---|---|
| フロントエンド | Next.js 14+ (TypeScript, App Router, Tailwind CSS) |
| バックエンド | Laravel 13 (PHP 8.3) |
| データベース | MySQL 8.0 |
| ローカル環境 | Docker Compose |

## 初回セットアップ

```bash
# 1. Laravel と Next.js を初期化（初回のみ）
make init

# 2. Docker コンテナを起動
make up

# 3. ログで起動確認
make logs
```

起動後:
- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000

## 開発コマンド

```bash
make up              # 環境起動
make down            # 環境停止
make test            # テスト実行
make lint-backend    # PHP lint チェック
make lint-backend-fix # PHP lint 自動修正
make migrate         # マイグレーション
make bash-backend    # バックエンド shell
make bash-frontend   # フロントエンド shell
make bash-db         # MySQL shell
```

## デプロイ（無料/低コスト構成）

| | サービス |
|---|---|
| フロントエンド | [Vercel](https://vercel.com) (無料) |
| バックエンド | [Railway](https://railway.app) または [Render](https://render.com) |
| データベース | Railway MySQL または [PlanetScale](https://planetscale.com) |

### 手順

- バックエンド（Railway）: `docs/deploy/railway-backend.md`

## AIエージェント向けドキュメント

- `CLAUDE.md` — Claude Code 向けガイド
- `AGENTS.md` — 詳細な開発ルール・コマンド一覧
- `.cursor/rules/main.mdc` — Cursor 向けルール
- `docs/adr/` — アーキテクチャ決定記録
