# System Architecture Documentation

## Overview
System design showing how data flows from database through services to frontend.

## Files
- `architecture.md` — System design overview (layers, principles, data flow)
- `architecture_layers.puml` — System diagram (components and connections)
- `seq_auth_registration.puml` — Registration sequence diagram
- `seq_checkout_flow.puml` — Checkout transaction sequence diagram

## Three-Layer Backend Architecture
1. **Routes** - HTTP handling, validation
2. **Services** - Business logic, orchestration
3. **Repositories** - Database queries only

## Key Principle
Routes → Services → Repositories (never skip layers)

## Related Documents
- `../ROLES/roles.md` — Authorization (services check roles)
- `../API/api.md` — Endpoints (route definitions)
- `../MODULES/modules.md` — Module structure (implementation plan)

## Revision History
- **v1.0** (Week 6) — Initial architecture design
