# Coding Conventions

## Data Validation
- All external data MUST be validated with Zod at system boundaries
- "System boundary" = API endpoint input, DB query result, third-party API response, environment variable
- Define Zod schemas in `packages/types/`, infer TypeScript types from them:
  ```typescript
  import { z } from 'zod';
  export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1).max(100),
  });
  export type User = z.infer<typeof UserSchema>;
  ```

## Logging
- Use the structured logger from `packages/shared/logger`
- Every log entry must include: `event` (snake_case), `timestamp`, and relevant context
- Log levels: `debug` (dev only), `info` (normal ops), `warn` (recoverable), `error` (needs attention)
- Never log PII (emails, names, passwords) — use IDs only

## Error Handling
- Custom errors extend `AppError` from `packages/shared/errors`
- Every error has a machine-readable `code` (e.g., `USER_NOT_FOUND`)
- Service layer catches Repo errors and translates them to domain-specific errors
- Never catch and ignore — always log, then handle or rethrow

## Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `user-service.ts` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Functions/Variables | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Zod schemas | PascalCase + Schema | `UserSchema` |
| Error codes | SCREAMING_SNAKE | `USER_NOT_FOUND` |

## Exports
- Named exports only — no default exports
- Index files are for re-exports only (no logic)
- Each module exports its public API from `index.ts`

## Testing
- Test files live next to source: `user-service.ts` → `user-service.test.ts`
- Use `describe` > `it` structure with descriptive names
- Each test file covers: happy path, error cases, edge cases
- Mock external dependencies (DB, APIs) — never mock internal modules
- Target coverage: 80% for service layer, 60% overall

## File Size
- Maximum 300 lines per file (enforced by linter)
- If approaching limit, split by concern:
  - Extract types to a separate file
  - Extract utility functions
  - Split large components into sub-components
