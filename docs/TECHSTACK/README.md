# Technology Stack Documentation

## Overview

This folder contains the **complete technology stack specification** for WineMarket. The stack is **locked as of Week 6** and defines all backend, frontend, database, and deployment technologies.

## Files

- `techstack.md` — Complete technology stack reference
  - Backend runtime & framework (Bun, Elysia)
  - Database & ORM (PostgreSQL, Drizzle)
  - Frontend framework & libraries (React, Vite, TanStack)
  - Validation & types (Zod)
  - Testing & deployment

## Purpose

The technology stack documentation:
- **Locks decisions** made in Week 6 (no changes after)
- **Justifies technology choices** with rationale
- **Lists dependencies** for reproducible builds
- **Guides implementation** across all team members
- **Documents lock date** (Week 6 end)

## Key Decisions

- ✅ Backend: Bun + Elysia (lightweight, type-safe)
- ✅ Database: PostgreSQL + Drizzle (standard, type-safe ORM)
- ✅ Frontend: React + Vite + TanStack (modern, performant)
- ✅ Validation: Zod (single source of truth)
- ✅ Testing: Vitest + Playwright (fast, comprehensive)
