# TypeScript Rules

Applies to: **/*.ts, **/*.tsx

- No `any` type. Use `unknown` and narrow with type guards or Zod parsing.
- No `as` type assertions without a comment explaining why it's safe.
- No `@ts-ignore` or `@ts-expect-error` without a linked issue/ticket.
- No `console.log` — use the structured logger from `packages/shared/logger`.
- No default exports — use named exports only.
- Prefer `const` over `let`. Never use `var`.
- All function parameters and return types must be explicitly typed (no implicit `any`).
- Use `satisfies` operator for type checking object literals when possible.
