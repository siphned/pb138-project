# API Endpoint Design Documentation

## Overview

This folder contains the **complete REST API specification** for WineMarket. Every endpoint is documented with:
- HTTP method & path
- Authorization requirements
- Request/response schemas (Zod-validated)
- Database operations

## Files

- `api.md` — Complete API reference
  - 8 modules (Auth, Users, Wines, Shops, Orders, Events, Reviews, Admin)
  - 50+ endpoints
  - All authorization requirements mapped to role matrix

## Purpose

The API design:
1. **Drives backend implementation** — Ondra & Johnny code from this spec
2. **Drives frontend integration** — Adam consumes via Kubb-generated hooks
3. **Defines contracts** — OpenAPI spec auto-generated from Elysia routes
4. **Ensures consistency** — Standard patterns across all modules

## Module Ownership

| Module | Owner |
|--------|-------|
| Auth | Ondra |
| Users | Ondra |
| Wines | Ondra |
| Winemakers | Ondra |
| Shops | Johnny |
| Products/Bundles | Johnny |
| Carts | Johnny |
| Orders | Johnny |
| Events | Ondra |
| Comments | Ondra |
| Reviews | Johnny |
| Admin | Both |

## Related Documents

- `../ROLES/roles.md` — Authorization rules (every endpoint references this)
- `../ARCHITECTURE/architecture.md` — Layered architecture (how routes → services → repos)
- `../MODULES/modules.md` — Module structure (who implements what)

## Revision History

- **v1.0** (Week 6) — Initial API design from PRD
