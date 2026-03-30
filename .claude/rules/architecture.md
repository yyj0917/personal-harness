# Architecture Rules

## Layer Dependencies
Files in `packages/ui/` may import from: service, types, config
Files in `packages/runtime/` may import from: service, config, types
Files in `packages/service/` may import from: repo, config, types
Files in `packages/repo/` may import from: config, types
Files in `packages/config/` may import from: types
Files in `packages/types/` may NOT import from any other package layer

Cross-cutting concerns (auth, telemetry, feature flags) MUST flow through the `Providers` interface.

## File Rules
- Maximum 300 lines per file. If approaching this limit, split into smaller modules.
- One concern per file. A file should do one thing well.
- Index files (`index.ts`) are for re-exports only — no logic.
