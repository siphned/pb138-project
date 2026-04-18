# ROLES Documentation

## Overview

This folder contains the **Role-Permission Matrix** — the source of truth for authorization in WineMarket.

## Files

- `roles.md` — Complete role-permission matrix mapping all user roles to features
  - 5 user roles: Guest, Customer, Winemaker, Shop Owner, Admin
  - 50+ features with permission definitions
  - Business rules and implementation notes

## Purpose

The role matrix:
1. **Defines authorization everywhere** — Backend service checks, Frontend UI show/hide
2. **Ensures consistency** — Single source of truth for who can do what
3. **Facilitates testing** — Test matrix exhaustively (5 roles × 50 features)
4. **Documents compliance** — Every feature knows its access rules

## Related Documents

- `../API/api.md` — API endpoints (aligned with role matrix)
- `../ARCHITECTURE/architecture.md` — System design and layering
- `../MODULES/modules.md` — Backend module breakdown

## Revision History

- **v1.0** (Week 6) — Initial matrix extracted from PRD requirements
