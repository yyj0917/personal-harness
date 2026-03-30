---
description: Refresh all domain skills by re-fetching official docs and updating Gotchas. Run monthly or after major framework updates.
---

For each skill in `.claude/skills/`:

1. **Scan references/** for each skill directory.
2. **Re-fetch** from official documentation sources (use Context7 if available, otherwise web search).
3. **Diff** the new content against existing references. If changed:
   - Update the reference file
   - Check if SKILL.md Gotchas need updating (new breaking changes?)
   - Check if examples/ are still valid
4. **Log changes** to `docs/plans/completed/skill-refresh-<date>.md`
5. **Summary**: report which skills were updated and what changed.

If no skills exist yet, suggest running `/create-skill` first.
