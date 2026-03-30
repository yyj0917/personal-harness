---
description: Create a new domain-specific skill using the latest official docs. Follows the domain skill setup guide methodology.
---

Follow the domain skill setup guide at `docs/guides/domain-skill-setup-guide.md` to create a production-grade skill.

1. **Interview me** about what skill to create. Ask:
   - What technology/framework? (e.g., Next.js App Router, Drizzle ORM)
   - What version? (e.g., Next.js 15, React Query v5)
   - What specific area? (e.g., routing, data fetching, caching)

2. **Create the skill directory** structure:
   ```
   .claude/skills/<skill-name>/
   ├── SKILL.md
   ├── references/
   ├── scripts/
   └── examples/
   ```

3. **Fetch latest patterns** from official documentation:
   - Use Context7 MCP if available: `resolve-library-id` then `query-docs`
   - Otherwise use web search targeting official docs sites only
   - Save to `references/` with source URLs

4. **Filter for senior-level patterns** using these criteria:
   - Scales to 100+ components/routes?
   - Includes error handling?
   - Type-safe?
   - Testable?
   - Official recommendation?

5. **Write SKILL.md** with:
   - description as a **trigger** (when should this fire?)
   - Core principles (only what changes Claude's default behavior)
   - Reference links to `references/`
   - Gotchas section (Breaking Changes from previous version + common Claude mistakes)
   - Under 500 lines

6. **Create good/bad examples** in `examples/`

7. **Create validation script** in `scripts/` if applicable

8. **Verify**: read the complete skill back and confirm it matches the guide's checklist.
