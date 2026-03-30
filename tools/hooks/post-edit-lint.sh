#!/bin/bash
# Post-edit hook: auto-format TypeScript files after edit
# Runs Prettier on modified .ts/.tsx files to enforce consistent formatting

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format TypeScript/JavaScript files
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  if command -v npx &> /dev/null && [ -f "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" ]; then
    npx prettier --write "$FILE_PATH" 2>/dev/null
  fi
fi

exit 0
