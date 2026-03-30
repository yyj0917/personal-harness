# Architecture Overview

## Layer Model

This project uses a strict layered architecture. Each layer has a fixed set of allowed dependencies.

```
┌─────────────────────────────────────────────┐
│                    UI                        │  ← React components, pages, client logic
│                 (packages/ui)                │
├─────────────────────────────────────────────┤
│                  Runtime                     │  ← Server boot, middleware, routing
│               (packages/runtime)             │
├─────────────────────────────────────────────┤
│                  Service                     │  ← Business logic, orchestration
│               (packages/service)             │
├─────────────────────────────────────────────┤
│                   Repo                       │  ← Data access (DB, API clients)
│                (packages/repo)               │
├─────────────────────────────────────────────┤
│                  Config                      │  ← Environment, feature flags
│               (packages/config)              │
├─────────────────────────────────────────────┤
│                  Types                       │  ← Pure types, Zod schemas
│               (packages/types)               │
└─────────────────────────────────────────────┘

Cross-cutting:  Providers (auth, telemetry, feature flags)
                └── Injected via explicit interface, NOT direct imports
```

## Dependency Rules

| Layer    | May import from              |
|----------|------------------------------|
| UI       | Service, Types, Config       |
| Runtime  | Service, Config, Types       |
| Service  | Repo, Config, Types          |
| Repo     | Config, Types                |
| Config   | Types                        |
| Types    | (nothing — leaf layer)       |

**Reverse dependencies are mechanically enforced** by the custom architecture linter in `tools/linters/`.

## Shared Utilities

Cross-layer utilities live in `packages/shared/`:
- `logger` — Structured JSON logging (never use console.log)
- `errors` — Custom error classes with error codes
- `utils` — Pure utility functions (no side effects)

Shared packages may be imported from any layer but must themselves only depend on `types`.

## Domain Organization

Each business domain gets its own directory within each layer:
```
packages/service/
├── auth/          ← Authentication domain
├── payments/      ← Payment domain
└── users/         ← User management domain
```

When adding a new domain, create the corresponding directories in ALL relevant layers.
