## Railway（バックエンド）デプロイ手順

対象: `backend/`（Laravel 13 + MySQL）

前提:
- モノレポのため **Railway の Backend サービスは `backend/` を Root/Working Directory に設定**する
- 独自ドメインなし（まずは Railway の提供 URL を使用）
- メール送信なし
- DB は Railway MySQL を使用

### 1. Railway プロジェクト作成

- Railway で New Project を作成
- `Add → Database → MySQL` で MySQL を追加
- `Add → GitHub Repo` でリポジトリを追加し、Backend サービスを作成

### 2. Backend サービス設定（モノレポ）

Railway の Backend サービス設定で、**Root Directory / Working Directory を `backend`** にする。

これができていないと、Composer/Artisan の実行パスがズレてデプロイが不安定になる。

### 3. Backend サービスの環境変数（Variables）

最低限:

- `APP_NAME`: `korean-topik-app`
- `APP_ENV`: `production`
- `APP_DEBUG`: `false`
- `APP_KEY`: `base64:...`（後述）
- `APP_URL`: Railway の Backend URL（デプロイ後の URL）
- `LOG_CHANNEL`: `stderr`
- `DB_CONNECTION`: `mysql`
- `FRONTEND_URL`: Vercel の URL（例: `https://xxxx.vercel.app`）
- `CORS_ALLOWED_ORIGINS`: Vercel のオリジン（**カンマ区切りで複数可**）。例: `https://korean-topik-app.vercel.app,https://korean-topik-app-git-release-v01-koshifutamis-projects.vercel.app`  
  フロントを Vercel に置くと、ブラウザから API を叩くとき **CORS が必須**です。未設定だと `localhost:3000` のみ許可されるため、本番では必ず設定する。

#### DB 接続（MySQL サービス変数の参照）

Backend サービス側で、MySQL サービスの変数を参照して `DB_*` を設定する。

Railway の変数参照は **`${{ServiceName.VAR}}`** 形式。
（`ServiceName` は左のサービス名。例: `MySQL`）

- `DB_HOST`: `${{MySQL.MYSQLHOST}}`
- `DB_PORT`: `${{MySQL.MYSQLPORT}}`
- `DB_DATABASE`: `${{MySQL.MYSQLDATABASE}}`
- `DB_USERNAME`: `${{MySQL.MYSQLUSER}}`
- `DB_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`

注意:
- `DB_HOST=127.0.0.1` / `localhost` は **絶対に使わない**
- `DB_HOST="${MYSQLHOST}"` のような書き方は参照として解決されず、空になることがある

### 4. APP_KEY の生成

ローカルで生成して Railway の `APP_KEY` に貼る。

```bash
cd backend
php artisan key:generate --show
```

出力された `base64:...` を `APP_KEY` に設定する。

### 5. マイグレーション / シード（Railway 上で実行）

ローカルから `php artisan migrate` を叩くのは避ける。
（Railway 内部ホスト `*.railway.internal` はローカルから解決できないため）

#### 5-1. Railway CLI で SSH 実行（推奨）

macOS:

```bash
brew install railway
railway login
```

リポジトリ直下でプロジェクトにリンク:

```bash
railway link
railway status
```

Backend サービスに入る（サービス名は `railway status` を参照）:

```bash
railway ssh --service <backend-service-name>
```

コンテナ内で実行:

```bash
php artisan config:clear
php artisan migrate --force
php artisan db:seed --force
```

※ `backend/` がルートになっていない場合は `cd backend` してから実行する。

### 6. 疎通確認

- `GET /api/v1/vocabularies` が `200` で返る
- `POST /api/v1/auth/register` が動く（本番で登録を開放する場合）
- 管理者ログインを使う場合は seed 済みであること（`admin@example.com / password`）

### 7. トラブルシュート

#### DB 接続エラー（Connection refused / getaddrinfo failed）

- Backend サービスの `DB_HOST/DB_PORT` が空になっていないか確認
- `DB_*` が `127.0.0.1` や `localhost` になっていないか確認
- `${{MySQL.MYSQLHOST}}` の `MySQL` 部分が、実際の DB サービス名と一致しているか確認

