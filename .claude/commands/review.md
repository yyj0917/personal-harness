---
description: Run a full code review on recent changes using the code-reviewer and security-reviewer agents
---

Run a comprehensive code review on all uncommitted changes:

1. First, use `git diff --name-only` to identify all changed files.
2. Use a subagent with type `code-reviewer` to review all changes for architecture compliance, code quality, and test coverage.
3. Use a subagent with type `security-reviewer` to scan for security vulnerabilities.
4. Synthesize both reviews into a single summary with:
   - 🔴 Must-fix issues (block merge)
   - 🟡 Should-fix issues (address before next release)
   - 🟢 Suggestions (nice to have)
5. If there are must-fix issues, list the specific files and what needs to change.
