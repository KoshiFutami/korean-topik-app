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

### 7. 音声ファイルの永続化

Railway のコンテナはデプロイのたびに再作成されるため、コンテナ内に保存した音声 MP3 はデフォルトでは消える。
Railway Volume を使うことで追加アカウント不要・設定のみで永続化できる。

#### 7-1. Procfile によるスタートコマンドの確認

`backend/Procfile` に以下が記載されている（リポジトリ管理済み）:

```
web: php artisan migrate --force && php artisan storage:link --force && php -S 0.0.0.0:$PORT -t public
```

`storage:link --force` がデプロイのたびに実行され、Volume へのシンボリックリンクが毎回再作成される。

#### 7-2. Railway Volume の作成とマウント

Railway の UI で以下の手順を実施する。

1. Railway プロジェクト → Backend サービスを選択
2. 上部タブ「**Volumes**」→「**+ New Volume**」
3. 以下を設定して保存:

| 項目 | 値 |
|------|-----|
| Mount Path | `/app/storage/app/public` |
| Size | 1 GB（目安、後から変更可） |

4. サービスを **Redeploy** する

これだけで `storage/app/public` がデプロイをまたいで永続化される。

> **Mount Path の補足**
> Railway が Nixpacks でビルドする PHP アプリのワーキングディレクトリは `/app`。
> よって `storage/app/public` の絶対パスは `/app/storage/app/public` になる。
> 不明な場合は Railway SSH で `pwd` + `ls storage/app/public` で確認する。

#### 7-3. 動作確認

- 再生ボタンを押して音声が流れることを確認
- 再デプロイ後も同じ音声が再生されることを確認
- Railway の Volumes タブで使用容量が増えていることを確認

#### 7-4. GCS（Google Cloud Storage）による永続化

TTS で既に GCP を使っているなら、同じプロジェクト・サービスアカウントで GCS バケットも利用できる。

##### GCS バケットの作成

1. [GCP コンソール](https://console.cloud.google.com/) → Cloud Storage → バケットを作成
   - 名前例: `korean-topik-audio`
   - リージョン: `asia-northeast1`（東京）
   - アクセス制御: **「均一」（uniform）** を選択
2. **バケットの公開設定**（ブラウザから音声 URL を直接再生するため）
   - バケット → 「権限」タブ → 「プリンシパルを追加」
   - 新しいプリンシパル: `allUsers`
   - ロール: `Storage オブジェクト閲覧者`（roles/storage.objectViewer）
   - 保存
3. **CORS 設定**（Vercel フロントからのリクエストを許可）

```bash
# cors.json を作成
cat > /tmp/cors.json <<'EOF'
[
  {
    "origin": ["https://*.vercel.app", "https://korean-topik-app.vercel.app"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
EOF

# gcloud CLI で適用
gcloud storage buckets update gs://korean-topik-audio --cors-file=/tmp/cors.json
```

##### サービスアカウントに GCS 権限を追加

TTS 用サービスアカウントに以下のロールを追加（GCP コンソール → IAM → サービスアカウントを選択 → 「権限を編集」）:

- `Storage オブジェクト管理者`（roles/storage.objectAdmin）

##### Railway 環境変数に追加

| 変数名 | 値 |
|--------|-----|
| `AUDIO_STORAGE_DISK` | `audio_gcs` |
| `GCS_AUDIO_BUCKET` | バケット名（例: `korean-topik-audio`） |
| `GCS_AUDIO_PATH_PREFIX` | （任意）フォルダプレフィックス、通常は空欄 |
| `GCS_CREDENTIALS_JSON` | サービスアカウント JSON の**内容**をそのまま貼る（後述） |

> **`GCS_CREDENTIALS_JSON` の設定方法**
>
> Railway のコンテナはエフェメラルのため、`GOOGLE_APPLICATION_CREDENTIALS` のようなファイルパス方式は使えません。
> 代わりに、サービスアカウント JSON の**中身**を丸ごと環境変数に貼り付けます。
>
> ```bash
> # ローカルでサービスアカウント JSON の内容を確認する
> cat /path/to/tts-credentials.json
> ```
>
> 出力された JSON（`{ "type": "service_account", ... }` の全文）を Railway の `GCS_CREDENTIALS_JSON` 変数に貼り付ける。
> 改行はそのまま貼ってよい（Railway が適切にエスケープします）。

##### 動作確認

- 再生ボタンを押して音声が流れることを確認
- GCS バケットに `vocabulary-audio/*.mp3` が作成されていることを確認
- 再デプロイ後も同じ音声が再生されることを確認

#### 7-5. （上級）AWS S3 による永続化

AWS アカウントがある場合。S3 バケットは「ACL 有効」「パブリックアクセス一部許可（ACL のみ）」が必要。

| 変数名 | 値 |
|--------|-----|
| `AUDIO_STORAGE_DISK` | `audio_s3` |
| `AWS_ACCESS_KEY_ID` | IAM アクセスキー |
| `AWS_SECRET_ACCESS_KEY` | シークレットキー |
| `AWS_DEFAULT_REGION` | `ap-northeast-1` |
| `AWS_BUCKET` | バケット名 |

### 8. トラブルシュート

#### DB 接続エラー（Connection refused / getaddrinfo failed）

- Backend サービスの `DB_HOST/DB_PORT` が空になっていないか確認
- `DB_*` が `127.0.0.1` や `localhost` になっていないか確認
- `${{MySQL.MYSQLHOST}}` の `MySQL` 部分が、実際の DB サービス名と一致しているか確認

