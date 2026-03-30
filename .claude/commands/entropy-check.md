---
description: Run entropy check to detect drift, stale patterns, and tech debt accumulation
---

Run the entropy management script and address any issues found:

1. Execute `bash tools/scripts/entropy-check.sh` to identify all violations.
2. For each violation found:
   - Architecture violations → fix the import or move code to the correct layer
   - TypeScript errors → fix type errors
   - Large files → split into smaller modules
   - console.log usage → replace with structured logger
   - Stale docs → review and update or flag for human review
3. After fixing, run the check again to verify all issues are resolved.
4. If there are TODO/FIXME/HACK markers older than 2 weeks, create entries in `docs/plans/tech-debt/` for tracking.
