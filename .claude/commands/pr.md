# pr

GitHub PR を作成または更新する。

## 手順

1. push 済みを確認（未 push なら `/push` を先に実行）。
2. 既存 PR の有無を確認: `gh pr view --json number,title,body,baseRefName,url`
   - **PR が既にある** → 未反映コミットを確認して `gh pr edit` で本文を更新する。
   - **PR がない** → 新規作成へ進む。
3. 新規作成時は `.github/pull_request_template.md` の構造に従って本文を書く。

   ```bash
   gh pr create --base main --title "feat: …" --body "$(cat <<'EOF'
   ## 概要

   ## 変更内容

   ## テスト
   - [ ] make test 通過
   - [ ] make lint-backend 通過

   ## チェックリスト
   - [ ] マイグレーションあり → make migrate の手順を記載

   ## 関連
   Closes #
   EOF
   )"
   ```

4. ブラウザでプレビューして確認する。

## 注意

- 同じブランチに既存 PR がある場合は `gh pr create` が失敗する。`gh pr edit` で更新すること。
