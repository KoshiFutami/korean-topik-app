# commit

未コミットの差分を確認し、意図ごとに分割してコミットする。

## 手順

1. `git status -sb` と `git diff`（必要なら `git diff --cached`）で変更範囲を把握する。
2. chore / feat / fix / docs / test など種類が混ざるなら**分割**する。
3. ファイル単位またはハンク単位でステージする。
4. メッセージは**日本語**で書く。`feat:` / `fix:` / `chore:` など Conventional Commits 風の接頭辞を付ける（例: `feat: 単語一覧APIを追加`）。
5. `.env`・シークレット・`vendor/` をコミットしない。
6. ユーザーが明示したメッセージがあればそれを優先する。
