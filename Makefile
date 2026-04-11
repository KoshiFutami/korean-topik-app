.PHONY: help init init-backend init-frontend up down logs test \
        lint-backend lint-backend-fix migrate fresh-migrate seed-vocabulary synthesize-vocabulary-audio \
        bash-backend bash-frontend bash-db \
        commit push pr pr-web pr-draft review approve

help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ── セットアップ ──────────────────────────────────────────────────────────────

init: init-backend init-frontend ## Laravel と Next.js を初期化（初回のみ）

init-backend: ## Laravel プロジェクトを初期化
	@if [ ! -f backend/composer.json ]; then \
		echo "Laravel を初期化しています..."; \
		docker run --rm \
			-v "$(PWD)/backend:/app" \
			-w /app \
			composer:latest \
			composer create-project laravel/laravel:^13.0 . --prefer-dist --no-interaction; \
		echo "Laravel Pint をインストールしています..."; \
		docker run --rm \
			-v "$(PWD)/backend:/app" \
			-w /app \
			composer:latest \
			composer require laravel/pint --dev --no-interaction; \
	else \
		echo "backend/composer.json が既に存在します。スキップします。"; \
	fi

init-frontend: ## Next.js プロジェクトを初期化
	@if [ ! -f frontend/package.json ]; then \
		echo "Next.js を初期化しています..."; \
		docker run --rm \
			-v "$(PWD)/frontend:/app" \
			-w /app \
			node:20-alpine \
			npx create-next-app@latest . \
				--typescript \
				--tailwind \
				--eslint \
				--app \
				--src-dir \
				--import-alias "@/*" \
				--use-npm; \
	else \
		echo "frontend/package.json が既に存在します。スキップします。"; \
	fi

# ── Docker ───────────────────────────────────────────────────────────────────

up: ## 全サービスを起動
	docker compose up -d

down: ## 全サービスを停止
	docker compose down

logs: ## ログを表示（Ctrl+C で終了）
	docker compose logs -f

# ── テスト ───────────────────────────────────────────────────────────────────

TEST_APP_KEY ?= base64:nF12noq1nxW3cMMh1fRH85ip/046y/Y4myDfwj0XNyk=

test: ## 全テストを実行
	@docker compose ps --status running --services | grep -qx backend || $(MAKE) up
	docker compose exec -e APP_ENV=testing -e APP_KEY=$(TEST_APP_KEY) backend php artisan test

test-filter: ## 特定のテストを実行 (例: make test-filter FILTER=UserTest)
	@docker compose ps --status running --services | grep -qx backend || $(MAKE) up
	docker compose exec -e APP_ENV=testing -e APP_KEY=$(TEST_APP_KEY) backend php artisan test --filter=$(FILTER)

# ── コード品質 ────────────────────────────────────────────────────────────────

lint-backend: ## PHP スタイルチェック（修正なし）
	docker compose exec backend ./vendor/bin/pint --test

lint-backend-fix: ## PHP スタイルを自動修正
	docker compose exec backend ./vendor/bin/pint

# ── データベース ──────────────────────────────────────────────────────────────

migrate: ## マイグレーションを実行
	docker compose exec backend php artisan migrate

fresh-migrate: ## DB を空にしてマイグレーション＋全シード（CSV 含めきれいに揃える）
	docker compose exec backend php artisan migrate:fresh --seed

seed-vocabulary: ## 語彙だけ vocabulary_bulk.csv と同期（VocabularyBulkSeeder のみ・他テーブルはそのまま）
	@docker compose ps --status running --services | grep -qx backend || $(MAKE) up
	docker compose exec backend php artisan db:seed --class=VocabularyBulkSeeder

synthesize-vocabulary-audio: ## Google TTS で語彙 MP3 を生成（GOOGLE_APPLICATION_CREDENTIALS 必須・OPTS で artisan 引数）
	@docker compose ps --status running --services | grep -qx backend || $(MAKE) up
	docker compose exec backend php artisan vocabulary:synthesize-audio $(OPTS)

# ── シェル ───────────────────────────────────────────────────────────────────

bash-backend: ## バックエンドコンテナの shell を開く
	docker compose exec backend sh

bash-frontend: ## フロントエンドコンテナの shell を開く
	docker compose exec frontend sh

bash-db: ## MySQL shell を開く
	docker compose exec db mysql -u topik -ptopik korean_topik

# ── Git / GitHub ─────────────────────────────────────────────────────────────

commit: ## ステージ済み変更をコミット（未ステージなら案内）
	@if git diff --cached --quiet; then \
		echo "ステージ済みの変更がありません。git add でステージしてから実行してください。"; \
	else \
		git commit; \
	fi

push: ## 現在ブランチをリモートへ push（upstream 追跡付き）
	git push -u origin HEAD

pr: ## PR を作成（gh CLI 必須）— 既存 PR がある場合は gh pr edit で更新してください
	gh pr create --fill

pr-web: ## ブラウザで PR 作成画面を開く
	gh pr create --web

pr-draft: ## Draft PR を作成
	gh pr create --fill --draft

review: ## 現在ブランチの PR を表示してレビュー
	gh pr view

approve: ## 現在ブランチの PR を承認
	gh pr review --approve --body "LGTM"
