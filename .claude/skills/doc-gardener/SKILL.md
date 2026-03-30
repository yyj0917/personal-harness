# Doc Gardener Skill

## When to fire
Use this skill for documentation maintenance tasks: freshness checks, cross-link validation, quality grade updates. Triggers on: "clean up docs", "update documentation", "doc health".

## Process

1. List all `.md` files in `docs/` with `git log --format="%ai" -1 -- <file>` to check last update
2. Flag files older than 30 days as potentially stale
3. Verify all relative links (`→ docs/...`) actually resolve to existing files
4. Check `docs/plans/active/` for plans marked as completed — move to `completed/`
5. Update quality grades if test coverage data is available

## Gotchas
- Don't delete docs — flag for human review
- Completed plans should be MOVED, not deleted
- Quality grades are subjective assessments — only update if you have concrete data (test coverage, lint results)
