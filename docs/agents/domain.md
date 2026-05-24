# Domain Documentation Layout

This is a **multi-context** monorepo. Domain knowledge is distributed.

## Structure
1. **Root**: `CONTEXT-MAP.md` lists all contexts and their paths.
2. **Apps**: Each app (e.g., `apps/server`, `apps/web`) has its own `CONTEXT.md` and optional `docs/adr/` directory.

## Consumer Rules
- Always check `CONTEXT-MAP.md` first.
- When working in a specific app, read its local `CONTEXT.md` before proposing architectural changes.
- Use `improve-codebase-architecture` to suggest cross-cutting improvements.
