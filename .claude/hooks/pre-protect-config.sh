#!/usr/bin/env bash
# PreToolUse フック: 保護ファイルへの変更をブロックする

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

# 保護対象ファイルリスト
PROTECTED_FILES=(
  ".claude/settings.json"
  ".claude/hooks/pre-protect-config.sh"
  ".claude/hooks/post-pint.sh"
  "backend/pint.json"
  "backend/phpunit.xml"
  ".github/workflows/backend-pint.yml"
)

# プロジェクトルートからの相対パスに正規化
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
RELATIVE_PATH="${FILE_PATH#$PROJECT_DIR/}"

for PROTECTED in "${PROTECTED_FILES[@]}"; do
  if [ "$RELATIVE_PATH" = "$PROTECTED" ] || [ "$FILE_PATH" = "$PROTECTED" ]; then
    echo "ERROR: '$PROTECTED' は保護されたファイルです。変更はブロックされました。" >&2
    echo "このファイルを変更する必要がある場合は、ユーザーに確認してください。" >&2
    exit 1
  fi
done

exit 0
