---
description: Run a full project health check — lint, typecheck, tests, architecture, and doc freshness
---

Run a comprehensive project health check:

1. `pnpm lint` — Check for lint errors
2. `pnpm typecheck` — TypeScript strict mode check
3. `pnpm test` — Run all tests, report coverage
4. `pnpm test:structural` — Architecture invariant tests
5. Check `docs/quality/` for current grades
6. Use a subagent with type `doc-gardener` to check documentation freshness

Produce a health report with:
- ✅ Passing checks
- ❌ Failing checks with details
- 📊 Test coverage percentage
- 📝 Documentation freshness status
- Overall grade: A/B/C/D/F
