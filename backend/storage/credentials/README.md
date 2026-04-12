# credentials（秘密情報用ディレクトリ）

Google Cloud Text-to-Speech など用の**サービスアカウント JSON** をここに置きます。

- 例: `tts-credentials.json`
- `backend/.env` の `GOOGLE_APPLICATION_CREDENTIALS` に、Docker 内パス  
  `/var/www/html/storage/credentials/tts-credentials.json`  
  を指定してください。

このディレクトリ内のファイル（本 README 以外）は `.gitignore` により **Git に含めません**。
