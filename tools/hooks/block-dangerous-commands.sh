#!/bin/bash
# Guardrail: Block dangerous commands before execution
# This hook runs on every Bash PreToolUse event

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block rm -rf on critical paths
if echo "$COMMAND" | grep -qE 'rm\s+(-rf|-fr)\s+(/|~|\.\.)'; then
  echo '{"decision":"block","reason":"Destructive rm -rf on critical path blocked. Use trash-cli or move to a temp directory instead."}' 
  exit 0
fi

# Block direct push to main/master
if echo "$COMMAND" | grep -qE 'git\s+push.*\s+(origin\s+)?(main|master)'; then
  echo '{"decision":"block","reason":"Direct push to main/master is blocked. Create a feature branch and use a PR workflow."}' 
  exit 0
fi

# Block secret exposure
if echo "$COMMAND" | grep -qE '(cat|less|more|head|tail).*\.(env|pem|key)'; then
  echo '{"decision":"block","reason":"Reading secret files (.env, .pem, .key) is blocked for security."}' 
  exit 0
fi

# Allow everything else
exit 0
