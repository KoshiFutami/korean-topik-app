# ADR 0002: エージェントのエントリポイントをポインタとして定義

## ステータス

採用済み

## コンテキスト

複数の AI エージェント（Claude、Cursor など）が同一リポジトリで作業する際、一貫したコンテキスト取得が必要です。

## 決定

- `CLAUDE.md` — Claude Code の最初の読み込みファイル（AGENTS.md へのポインタ）
- `AGENTS.md` — 詳細なルーティングと開発ガイドライン
- `.cursor/rules/main.mdc` — Cursor のルールファイル

## 影響

- 新しいルールは `AGENTS.md` に追記する
- `CLAUDE.md` は軽量に保ち、詳細は `AGENTS.md` へ委譲する
