# Code Reviewer Skill

## When to fire
Use this skill when reviewing code changes, PRs, or when asked to verify code quality. Triggers on: "review", "check this code", "is this good", "PR review".

## Review Process

1. **Read the diff** — identify all changed files and understand the scope
2. **Check architecture** — verify layer dependencies per `docs/architecture/overview.md`
3. **Check boundaries** — ensure Zod validation at all external data entry points
4. **Check tests** — verify test coverage for new service-layer logic
5. **Check patterns** — search existing code for precedent before flagging "unusual" patterns

## Gotchas
- Don't flag Zod schema definitions in the `types` layer as "missing validation" — they ARE the validation, used at boundaries
- `Providers` interface is the ONLY allowed cross-cutting path — don't suggest direct imports
- File size limit is 300 lines, not 200 — check before flagging
- Named exports only — default exports are always wrong in this project

## References
→ `docs/conventions/coding.md` for full coding rules
→ `docs/architecture/overview.md` for layer dependency graph
