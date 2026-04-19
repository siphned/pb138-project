# Backend Module Breakdown

## Overview
Defines which backend developer owns which modules and the implementation order.

## Files
- `modules.md` — Module ownership and implementation plan
  - Ondra: 8 modules (Auth, Users, Wines, Winemakers, Events, Comments, Email, Admin)
  - Johnny: 6 modules (Shops, Products, Carts, Orders, Reviews, Admin shared)
  - 3-phase implementation order with dependencies
  - File naming conventions and checklist

- `module_dependencies.puml` — Dependency graph (build order)
  - Phase 1 foundation (Auth, Users)
  - Phase 2 core (Wines, Shops, Products, Carts)
  - Phase 3 advanced (Orders, Events, Comments, Reviews, Admin)

## Key Rules
1. **Build in dependency order** - Don't start a module until its dependencies are done
2. **40 endpoints per developer** - Roughly balanced workload
3. **Single responsibility** - Each module owns one feature area
4. **Parallel work possible** - Ondra can do Wines while Johnny does Shops

## Related Documents
- `../API/api.md` — Endpoint specs (what to build)
- `../ROLES/roles.md` — Authorization (what to check)
- `../ARCHITECTURE/architecture.md` — How to structure code

## Revision History
- **v1.0** (Week 6) — Module ownership and plan
