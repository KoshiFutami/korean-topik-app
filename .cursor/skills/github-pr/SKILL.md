---
name: github-pr
description: GitHub で PR を作成・更新する手順（gh CLI・Makefile）。テンプレに沿ったタイトル・本文。既存 PR では未反映コミットを追記。push 後に使う。
---

# GitHub PR 作成スキル

## 前提

- [GitHub CLI](https://cli.github.com/)（`gh`）をインストールし、`gh auth login` 済みであること
- 変更を push 済みであること（`git push -u origin <branch>`）

## タイトル・説明文（テンプレート準拠）

[`.github/pull_request_template.md`](../../../.github/pull_request_template.md) の見出しに沿って書く。

### タイトル

- **Conventional Commits 風の接頭辞**（`feat:` / `fix:` / `chore:` / `docs:` / `refactor:` など）＋ **一行で変更要約**（目安 50〜72 文字以内）。

### 本文（各セクションの役割）

| 見出し | 書くこと |
|--------|----------|
| 概要 | **なぜ**この PR が必要か。背景・目的を 1〜3 文。 |
| 変更内容 | **何を**どう変えたか。箇条書き。ファイル名の羅列だけにしない。 |
| テスト | `make test` / `make lint-backend` の確認状況にチェックを入れる。 |
| チェックリスト | 該当項目にチェック。マイグレーションがあれば `make migrate` の手順を書く。 |
| 関連 | Issue や議論へのリンク。`Closes #123` はここで。 |

### 作成の流れ（推奨）

1. 差分を踏まえて内容を埋める。
2. **どちらか**:
   - **A**: `make pr`（`--fill`）→ すぐ `gh pr edit` でテンプレ構造に差し替える。
   - **B**: `gh pr create --base main --title "feat: …" --body "…"` で直接作成。
3. ブラウザでプレビューし確認。

### 既存 PR がある場合（追 push 後もタイトル・説明を最新にする）

1. **PR の有無を確認**

   ```bash
   gh pr view --json number,title,body,baseRefName,url
   ```

2. **未反映コミットの確認**

   ```bash
   git fetch origin
   git log "origin/main"..HEAD --oneline
   ```

3. **本文の更新**

   ```bash
   gh pr edit --title "feat: …" --body "…"
   ```

エージェントは **push のあと必ず** `gh pr view` で既存 PR を確認し、あれば更新してから新規 `gh pr create` を試みないこと。

## よく使うコマンド

| 目的 | コマンド |
|------|----------|
| PR の確認 | `gh pr view --json number,title,body,baseRefName,url` |
| タイトル・本文を編集 | `gh pr edit` |
| 新規 PR（下書き） | `make pr` |
| ブラウザで作成 | `make pr-web` |
| 下書き PR | `make pr-draft` |

## トラブルシュート

- `gh: command not found` → `brew install gh`（macOS）
- 認証エラー → `gh auth login`
- リモートにブランチが無い → 先に `git push -u origin HEAD`
