# Architecture Redesign Pipeline (2026-04-24)

## Purpose

This document records the structured redesign discussion triggered by the architecture audit (`2026-04-24-architecture-audit.md`).

---

## Status Overview

| Section | Topic | Status |
|---|---|---|
| A | Auth & Identity | ✅ Complete |
| B | Frontend Route Tree | ✅ Complete |
| C | RBAC (Role-Based Access Control) | ✅ Complete |
| D | Guest Sessions & Cart | ✅ Complete |
| E | Database Schema Cleanup | ✅ Complete |
| F | Tooling & Generation | ✅ Complete |
| G | Seed Data & Testing | ✅ Complete |

---

## Final Implementation Summary

- **Authentication**: Fully integrated with Clerk. Profile data is synced via `lazyGetOrCreate` in the `users` module.
- **RBAC**: Migrated to a uniform `AppRole[]` array in Clerk `public_metadata`.
- **Routes**: Implemented a pathless layout tree in TanStack Router. Shop management is fully nested under `/shops/:id/`.
- **Guest Experience**: Server-side guest sessions enable persistent carts and guest checkout.
- **Stock Management**: Atomic allocation of winemaker stock to retail products is enforced at the repository level.
- **API**: Orval generates type-safe hooks from the backend OpenAPI spec.
- **Testing**: Comprehensive unit and integration tests (130+) verify all business logic and repository transactions.

---

## Revision History

- **2026-04-25** — Redesign pipeline closed; all sections implemented and verified.
- **2026-04-24** — Pipeline document created; decisions recorded.
