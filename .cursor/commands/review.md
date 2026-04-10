---
description: 差分・PR・テストをレビュー観点で確認する（セキュリティ・正しさ・テスト）
---

# review

## 目的

マージ前に **正しさ・セキュリティ・保守性・テスト** を確認する。

## 手順（エージェント向け）

1. 対象: 現在ブランチの `git diff main...HEAD` またはオープンな PR の差分（`gh pr diff`）。
2. **正しさ**: 要求を満たすか、境界条件・エラーハンドリングは十分か。
3. **セキュリティ**: 認証・認可・入力バリデーション・SQL インジェクション・秘密情報の混入。
4. **保守性**: 命名、レイヤー違反（Controller にビジネスロジックがないか）、重複、不要な複雑さ。
5. **テスト**: 変更に対しテストが付いているか。バックエンドなら `make test` を提案。
6. **Pint**: `make lint-backend` でコードスタイルを確認。

## CLI（参考）

```bash
gh pr view
gh pr diff
make test
make lint-backend
```

## Makefile ショートカット

```bash
make review
```

現在ブランチに紐づく PR を `gh pr view` で表示する（`gh` 必須）。
