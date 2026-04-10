---
name: korean-topik-dev
description: korean-topik-app モノレポの開発手順・アーキテクチャ・Docker/Makefile。backend/frontend の変更時に参照する。
---

# korean-topik-app 開発スキル

## いつ使うか

- このリポジトリで機能追加・バグ修正・リファクタをするとき
- レイヤー配置や「どこに何を書くか」を揃えたいとき

エントリの短いポインタは [AGENTS.md](../../../AGENTS.md)。Claude Code は [CLAUDE.md](../../../CLAUDE.md) も参照。

作業の進め方（計画→実行・1 垂直スライスずつ・`make test` で完了）は [ADR 0003](../../../docs/adr/0003-plan-execute-test.md)。

## バックエンドアーキテクチャ（Laravel）

```
backend/app/
├── Http/
│   ├── Controllers/Api/V1/   # API コントローラ（薄く保つ）
│   └── Requests/             # Form Request バリデーション
├── Models/                   # Eloquent モデル
├── Services/                 # ビジネスロジック（Controller から分離）
└── Repositories/             # DB アクセス抽象（必要に応じて）
```

- **Controller にビジネスロジックを書かない** → `Services/` に分離
- バリデーションは `Form Request` クラスで行う
- API ルートは `routes/api.php` に `v1` プレフィックスで定義
- 認証は **Laravel Sanctum**（Bearer トークン）

```php
// routes/api.php の例
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('vocabulary', VocabularyController::class);
    });
});
```

## PHP コード品質（Laravel Pint）

- 手動チェック: `make lint-backend`
- 自動修正: `make lint-backend-fix`
- Claude Code 利用時は `.claude/hooks/post-pint.sh` が PostToolUse で動く
- `.claude/hooks/pre-protect-config.sh` が `pint.json` / `phpunit.xml` の編集をブロックする

## フロントエンドアーキテクチャ（Next.js）

```
frontend/src/
├── app/                      # App Router（ページ・レイアウト）
├── components/               # 再利用コンポーネント
│   ├── ui/                   # 汎用 UI（ボタン・カード等）
│   └── features/             # 機能ごとのコンポーネント
└── lib/
    ├── api/                  # バックエンド API クライアント
    └── types/                # 型定義
```

- API URL は `process.env.NEXT_PUBLIC_API_URL` 経由
- Server Component / Client Component を適切に使い分ける

## Docker / Make

- ルートで `make up` → `make test` / `make migrate` / `make lint-backend`
- backend のログ: `docker compose logs -f backend`
- DB ホスト名は **コンテナ間で `db`**（ホストマシンからは `localhost:3306`）

## マイグレーション

```bash
make migrate          # マイグレーション実行
make fresh-migrate    # DB リセット＋マイグレーション＋シード
```

## 変更時の注意

- `composer.json` や `Dockerfile.dev` を変えたらイメージ再ビルドが必要（`docker compose build`）
- マイグレーションファイルは **一度作成したら修正しない**（新しいマイグレーションを追加する）

## PR を出すとき

- `git push` 後に `make pr`（要 `gh`）。詳細は `github-pr` スキル参照。
