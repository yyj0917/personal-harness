# CLAUDE.md — Harness Engineering Foundation

## Project Overview
This is a domain-agnostic harness engineering scaffold.
All code is agent-generated. Humans design the environment; agents write the code.

## Architecture
→ See `docs/architecture/overview.md` for full layer map.

Layer order (strict, enforced by linter):
**Types → Config → Repo → Service → Runtime → UI**

- Reverse dependencies are FORBIDDEN and CI will reject them.
- Cross-cutting concerns (auth, telemetry, feature flags) flow through `Providers` interface ONLY.
- Each file MUST stay under 300 lines. Split if approaching limit.

## Build & Test
```bash
pnpm install          # Install dependencies
pnpm typecheck        # TypeScript strict mode
pnpm lint             # ESLint + custom architecture linter
pnpm test             # Vitest unit tests
pnpm test:structural  # Architecture invariant tests
pnpm build            # Production build
```

## Coding Conventions
→ See `docs/conventions/coding.md` for full rules.

- **Boundary parsing**: Always validate external data with Zod at system boundaries.
- **Structured logging only**: No `console.log`. Use the shared logger from `packages/shared/logger`.
- **No default exports**: Use named exports everywhere.
- **Error handling**: Never swallow errors silently. Log + rethrow or handle explicitly.
- **Naming**: PascalCase for types/interfaces, camelCase for variables/functions, kebab-case for files.

## Key Decisions
→ See `docs/design/` for detailed design docs with verification status.

- TypeScript strict mode everywhere (no `any`, no `as` casts without comment)
- Zod for runtime validation, inferred types for DRY
- pnpm workspace monorepo structure
- Vitest for testing

## Current Work
→ See `docs/plans/active/` for in-progress work.
→ See `docs/plans/tech-debt/` for known issues.

## Quality Standards
→ See `docs/quality/` for per-domain quality grades.

Target: All domains at grade B+ or above.
Minimum test coverage: 80% for service layer, 60% overall.

## Agent Guidelines
- Read this file first, then navigate to linked docs as needed.
- When unsure about architecture, check `docs/architecture/overview.md`.
- When unsure about a convention, check `docs/conventions/`.
- Before creating new patterns, search existing code for precedent.
- If a task is complex, write a plan in `docs/plans/active/` before implementing.
- After completing work, run `pnpm lint && pnpm test && pnpm typecheck` to verify.
