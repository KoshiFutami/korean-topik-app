# push

ローカルのコミットをリモートに push し、PR 作成できる状態にする。

## 手順

1. `git status` でコミット済みを確認（未コミットがあれば `/commit` を先に実行）。
2. `git push -u origin HEAD` で push する。
3. push 後、PR がまだなければ `/pr` または `make pr-web` へ進む。

## 注意

- `git push --force` は共有ブランチでは原則使わない。
