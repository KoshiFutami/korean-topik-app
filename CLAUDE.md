# Korean TOPIK App — Claude Agent ガイド

## はじめに

まず **`AGENTS.md`** を読んでルーティングルール・共通コマンドを確認してください。

## スタック概要

| レイヤー | 技術 | ディレクトリ |
|----------|------|-------------|
| フロントエンド | Next.js (TypeScript) | `frontend/` |
| バックエンド | Laravel (PHP 8.3) | `backend/` |
| データベース | MySQL 8.0 | Docker サービス `db` |

## 重要なルール

1. **linter/hook をバイパスしない** — `--no-verify` や設定の弱体化は禁止。失敗したら根本原因を修正する
2. **大きな変更前は Plan Mode** — アーキテクチャ変更・新機能追加は ADR 0003 参照
3. **作業完了前に `make test` を実行** — テストが通っていない実装は完了とみなさない
4. **1 つの垂直スライスずつ** — 1 つのエンドポイント/ユースケースを完成させてから次へ

## フック設定

`.claude/settings.json` で以下のフックが有効です：

- **PreToolUse (Write/Edit)**: 保護ファイルへの変更をブロック
- **PostToolUse (Write/Edit)**: PHP ファイルを Laravel Pint で検証

## 参照

- `AGENTS.md` — 詳細なルーティング・コマンド一覧
- `docs/adr/` — アーキテクチャ決定記録
- `docker-compose.yml` — ローカル開発環境
- `Makefile` — 開発コマンド
