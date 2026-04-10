#!/usr/bin/env bash
# PostToolUse フック: PHP ファイルを Laravel Pint で検証する

set -euo pipefail

# 標準入力から Claude のフックペイロードを読み取る
INPUT=$(cat)

# 編集対象のファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tool = data.get('tool_name', '')
inp = data.get('tool_input', {})
if tool in ('Write', 'Edit', 'MultiEdit'):
    print(inp.get('file_path', inp.get('path', '')))
" 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# PHP ファイルのみ対象
if [[ "$FILE_PATH" != *.php ]]; then
  exit 0
fi

# backend/ ディレクトリ内のファイルのみ対象
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
if [[ "$FILE_PATH" != "$PROJECT_DIR/backend/"* ]] && [[ "$FILE_PATH" != "backend/"* ]]; then
  exit 0
fi

# Pint が存在するか確認
PINT_PATH="$PROJECT_DIR/backend/vendor/bin/pint"
if [ ! -f "$PINT_PATH" ]; then
  # Pint がない場合はスキップ（composer install 前の可能性）
  exit 0
fi

echo "--- Laravel Pint チェック: $FILE_PATH ---"

# pint --test でスタイルチェック（修正はしない）
if ! "$PINT_PATH" --test "$FILE_PATH" 2>&1; then
  echo ""
  echo "ERROR: Laravel Pint のスタイルチェックに失敗しました。" >&2
  echo "修正するには: make lint-backend-fix" >&2
  echo "または: ./vendor/bin/pint $FILE_PATH" >&2
  exit 1
fi

exit 0
