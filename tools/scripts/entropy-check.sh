#!/bin/bash
# Entropy Management — Garbage Collection for Agent-Generated Code
#
# Run this periodically (weekly recommended) to catch drift:
#   node tools/scripts/entropy-check.mjs
#
# Or set up as a Claude Code command: /entropy-check

set -euo pipefail

echo "🧹 Running entropy check..."
echo "================================"

ERRORS=0

# 1. Architecture lint
echo ""
echo "📐 Architecture lint..."
if node tools/linters/architecture-linter.mjs 2>/dev/null; then
  echo "  ✅ Architecture: Clean"
else
  echo "  ❌ Architecture: Violations found"
  ERRORS=$((ERRORS + 1))
fi

# 2. TypeScript strict check
echo ""
echo "🔷 TypeScript check..."
if pnpm typecheck 2>/dev/null; then
  echo "  ✅ TypeScript: Clean"
else
  echo "  ❌ TypeScript: Errors found"
  ERRORS=$((ERRORS + 1))
fi

# 3. Check for large files
echo ""
echo "📏 File size check..."
LARGE_FILES=$(find packages/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | awk '$1 > 300 {print "  ⚠️  " $2 ": " $1 " lines"}')
if [ -z "$LARGE_FILES" ]; then
  echo "  ✅ All files under 300 lines"
else
  echo "  ❌ Files exceeding limit:"
  echo "$LARGE_FILES"
  ERRORS=$((ERRORS + 1))
fi

# 4. Check for console.log usage
echo ""
echo "📋 Structured logging check..."
CONSOLE_USAGE=$(grep -rn "console\.\(log\|warn\|error\|info\)" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".test." | grep -v "// " | head -10)
if [ -z "$CONSOLE_USAGE" ]; then
  echo "  ✅ No console.* usage"
else
  echo "  ❌ console.* found (use structured logger):"
  echo "$CONSOLE_USAGE" | head -5 | sed 's/^/  /'
  ERRORS=$((ERRORS + 1))
fi

# 5. Check for stale docs
echo ""
echo "📝 Documentation freshness..."
STALE_DOCS=$(find docs/ -name "*.md" -mtime +30 2>/dev/null | head -10)
if [ -z "$STALE_DOCS" ]; then
  echo "  ✅ All docs updated within 30 days"
else
  echo "  ⚠️  Potentially stale docs (30+ days):"
  echo "$STALE_DOCS" | sed 's/^/  /'
fi

# 6. Check for TODO/FIXME/HACK comments
echo ""
echo "🔍 Tech debt markers..."
DEBT_COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l)
echo "  ℹ️  Found $DEBT_COUNT TODO/FIXME/HACK markers"

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ Entropy check passed — codebase is clean"
  exit 0
else
  echo "❌ Entropy check found $ERRORS issue(s) — needs cleanup"
  echo "→ Run 'claude \"Fix all entropy check violations\"' to auto-fix"
  exit 1
fi
