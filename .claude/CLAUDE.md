# CLAUDE.md: Winery Project Development Guide

## Project Overview
**Course**: PB138 - Úvod do vývoje webu (Web Development Introduction)
**Project**: Winery Management Application
**Duration**: 13-week semester-long project
**Team Size**: 3-4 students

This is a production-quality team project with strict requirements and three milestone evaluations. All work should be tracked via merge requests with code review before merging to main.

---

## Core Project Requirements

### Mandatory Features
- **Permission-based Authorization**: Role-based access control with clearly defined user roles
- **Database**: 10+ entities with well-designed ERD
- **Back-office**: Admin interface for application management
- **Email Communication**: Notifications, registration confirmations, and other transactional emails
- **Component Library**: Reusable UI components for consistency
- **Testing**: E2E tests (via Cypress/Playwright) + Unit tests (Jest/Vitest) with meaningful coverage
- **Theme Support**: Light and dark mode across entire application

### Quality Standards
- Clean, well-structured code following best practices
- Code review on all changes via merge requests
- Consistent code style via ESLint and Prettier (enforced in CI/CD)
- Meaningful commit messages following conventional commits
- Comprehensive documentation (API docs, setup instructions, architecture decisions)

---

## Backend Architecture (Mandatory for All Backend Work)

Use **modular monolith with layered architecture**:

```
apps/server/src/
  modules/
    auth/
      auth.routes.ts        # HTTP layer (Elysia routes)
      auth.service.ts       # Business logic
      auth.repository.ts    # Database access
      auth.schema.ts        # Zod schemas (validation + types)
      index.ts
    users/
      users.routes.ts
      users.service.ts
      users.repository.ts
      users.schema.ts
      index.ts
    winemakers/
    wines/
    events/
    orders/
    admin/
    email/
    (etc.)
  db/
    schema.ts              # Drizzle schema (source of truth for DB)
  utils/
    auth.ts
    errors.ts
  app.ts                  # Elysia app setup
```

**Layer Responsibilities**:
- **Schema** (auth.schema.ts): Zod schemas = types + validation + OpenAPI
- **Repository** (auth.repository.ts): Pure DB queries, no business logic
- **Service** (auth.service.ts): Business logic, orchestration
- **Routes** (auth.routes.ts): HTTP layer, error handling

**Critical Rule**: Never call repository from routes directly. Always go through service.

---

## Frontend Architecture (Mandatory for All Frontend Work)

Use **file-based routing with component isolation**:

```
apps/web/src/
  routes/
    __root.tsx            # Layout wrapper
    index.tsx             # Home page
    dashboard/
      index.tsx           # /dashboard
      $id.tsx             # /dashboard/:id (dynamic)
      -components/        # Private: only used in dashboard/*
        DashboardCard.tsx
        DashboardTable.tsx
      -hooks/             # Private: only used in dashboard/*
        useDashboard.ts
    admin/
      index.tsx
      -components/
  components/
    ui/                   # shadcn/ui components
      button.tsx
      card.tsx
    layout/               # Shared layout components
      Header.tsx
      Sidebar.tsx
  hooks/                  # Global hooks
    useAuth.ts
    useFetch.ts
  lib/
    api.ts               # Generated Kubb client instance
    utils.ts
```

**Rules**:
- Route = URL path
- `-components/` = private, only imported within that route subtree
- `-hooks/` = private hooks, only for that route
- Public components go in `/components/ui/` or `/components/layout/`
- No index files that re-export everything (explicit imports only)

---

## Development Workflow

### How I Work with Your Project
1. **Read existing code first** before suggesting changes
2. **Prefer editing over creating** new files to keep codebase clean
3. **Only implement what's requested** - avoid over-engineering or adding unnecessary features
4. **Security first** - all code will prioritize security and follow OWASP standards
5. **Respect your Git workflow** - I'll work via merge requests and ask for confirmation on risky operations

### Code Quality
- No security vulnerabilities (SQL injection, XSS, command injection, etc.)
- Avoid premature abstractions - three similar lines is better than unnecessary utilities
- Don't add comments/docstrings to code I didn't change
- Keep complexity minimal for the current task

### Before Making Large Changes
- I will ask for confirmation before destructive operations (force push, hard reset, deleting branches)
- I will explore and understand existing code patterns before suggesting refactors
- I will highlight architectural decisions that need team discussion

---

## Team Roles & Responsibilities (Locked In)

### Matej (Team Lead + Frontend Secondary)
**You own:**
- Architecture decisions (ERD, API design, module structure)
- Code review on all PRs
- Task assignment & unblocking
- Integration (FE ↔ BE via OpenAPI)
- Documentation (architecture.md, API specs, etc.)
- Troubleshooting and escalation

**You do NOT:**
- Implement most features (Ondra, Johnny, Adam do that)
- Debug every bug (let team own their code)
- Change decisions without discussion

### Ondra & Johnny (Backend Developers)
**Responsibilities:**
- Implement backend modules (routes, services, repositories)
- Maintain database schema (schema.ts)
- Write OpenAPI-compliant endpoints
- Unit testing
- Follow layered architecture strictly

### Adam (Frontend Developer)
**Responsibilities:**
- Implement pages & components
- Consume generated Kubb API client
- E2E testing
- Follow route-based structure
- Styling & responsiveness

---

## Git Workflow (Mandatory — Jira Integrated)

**Full guide**: `docs/WORKFLOW.md`

**Branch Strategy:**
```
main (production/release)
  ↑ merge only at milestones
dev (integration)
  ↑ merge requests from feature branches
feature/WINE-XX-* (individual tasks)
```

**Naming Convention (Jira key required):**
- `feature/WINE-42-auth-login-endpoint`
- `feature/WINE-15-wine-crud-backend`
- `fix/WINE-88-cart-merge-on-login`
- `docs/WINE-5-api-spec`
- `chore/WINE-3-setup-ci`

**Commit Message Format:**
```
<type>(WINE-<id>): <short description>
```
Examples:
- `feat(WINE-42): add POST /auth/login endpoint`
- `fix(WINE-88): merge guest cart on login`
- `docs(WINE-5): add auth module API spec`

**MR Title Format:**
```
[WINE-XX] Short description
```

**Workflow (Every Task):**
```bash
# 1. Pick Jira ticket → move to "In Progress"
git checkout dev && git pull origin dev
git checkout -b feature/WINE-42-short-description

# 2. Work with Jira-scoped commits
git commit -m "feat(WINE-42): description"
git push -u origin feature/WINE-42-short-description

# 3. Open MR on GitLab
#    Title:  [WINE-42] Description
#    Target: dev
#    Reviewer: Matej

# 4. Move Jira ticket to "In Review"
# 5. After approval + green pipeline → Squash & Merge
# 6. Move Jira ticket to "Done"
```

**Rules:**
- ✅ Every branch must include `WINE-XX` — Jira links via this
- ✅ Every commit must include `(WINE-XX)` in scope
- ✅ Every MR title must start with `[WINE-XX]`
- ✅ Pipeline must pass before merge
- ✅ At least one approval before merge
- ✅ Squash commits on merge
- ✅ Delete source branch on merge
- ❌ Never push directly to main
- ❌ Never push directly to dev

---

## Project Milestones

### Milestone 1 (Week 7) — Design Complete
**Goal**: Architecture so solid that implementation is straightforward

**Deliverables** (must have ALL before evaluation):
- ✅ PlantUML ERD diagram (text-based, in `/docs/erd.puml`)
- ✅ Use Case diagram (from PRD + ERD analysis)
- ✅ Role-Permission Matrix (CRITICAL: defines auth throughout system)
- ✅ API endpoint design (list of main endpoints)
- ✅ Architecture document (`docs/architecture.md`)
- ✅ Requirements document (functional & non-functional)
- ✅ Figma wireframes (main pages)
- ✅ Backend module structure (roles, auth, users, main entities, admin, email)
- ✅ Frontend page structure (routes)
- ✅ Jira epics & Sprint 1 tasks
- ✅ GitLab repo with protected branches & CI
- ✅ Turborepo monorepo setup

**What I'll help with**: Design validation, architecture review, documentation generation

**Most Critical (Don't Forget)**:
- Role-Permission Matrix → defines everything downstream
- API endpoint list → backend team starts coding from this
- Backend module breakdown → Ondra & Johnny use this immediately
- Use case diagram → proves you understand the system

### Milestone 2 (Week 10) — Core Implementation
**Goal**: DB + API + basic FE working end-to-end

**Deliverables**:
- ✓ Database initialized (Drizzle migrations deployed)
- ✓ Backend modules implemented (routes, services, repos)
- ✓ OpenAPI spec generated from Elysia endpoints
- ✓ Kubb generated frontend client hooks
- ✓ Frontend pages consuming API hooks
- ✓ Basic auth flow working
- ✓ Initial test coverage (unit + E2E)
- ✓ Deployed to staging or development environment

**What I'll help with**: Feature implementation, API development, test writing

### Milestone 3 (Week 13) — Feature Complete & Polished
**Goal**: Production-ready, tested, deployable application

**Deliverables**:
- ✓ All features from PRD implemented
- ✓ Comprehensive test coverage (>70%)
- ✓ Light and dark theme working everywhere
- ✓ Email notifications configured
- ✓ Admin interface functional
- ✓ Code quality checks passing in CI/CD
- ✓ Final documentation (API docs, setup guide, deployment)

**What I'll help with**: Feature completion, bug fixes, performance optimization, documentation

### Final Defense (Exam Week)
- Demonstrate all functionality working
- Explain architecture decisions
- Discuss team collaboration process
- Answer technical questions

---

## Technology Stack (Final & Locked)

This is the **actual stack** you committed to. No changes.

### Backend
- **Runtime**: Bun
- **API Framework**: Elysia
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod (single source of truth)
- **API Contract**: OpenAPI (auto-generated)
- **Auth**: JWT or Lucia
- **Email**: Resend or Nodemailer
- **Testing**: Vitest + Playwright

### Frontend
- **Runtime**: Bun
- **Framework**: React + TypeScript
- **Build**: Vite
- **Routing**: TanStack Router (file-based)
- **State**: TanStack Query (server state)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Generated API Client**: Kubb (from OpenAPI)
- **Testing**: Playwright (E2E)
- **Theme**: Light/Dark via Tailwind

### Monorepo & Shared
- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Workspace**: @repo/types, @repo/api, @repo/ui, @repo/config

### DevOps & Tools
- **Git**: GitLab (MUNI instance)
- **Git Flow**: main (prod) ← dev (integration) ← feature/*
- **CI/CD**: GitLab CI
- **Linting**: ESLint
- **Formatting**: Prettier
- **Project Mgmt**: Jira (Scrum)
- **Design**: Figma

---

## The Critical Pipeline (Most Important)

This is the core architecture. Master it:

```
Database Schema → Drizzle ORM → Service Layer → API Routes (Elysia + Zod)
    ↓
OpenAPI Spec (auto-generated) → Kubb code-gen
    ↓
React hooks (@repo/api) → Frontend components
    ↓
Users interact with typed, validated, synced system
```

**Why this matters**:
- Define Zod schema → backend validates AND frontend types are generated
- One place to change = everywhere updates automatically
- No frontend/backend type mismatch
- This is industry-level, not school-project workflow

---

## Code Review Standards
All changes must:
1. Have a descriptive MR title and description
2. Pass all lint checks and tests
3. Have at least one approval from team member
4. Not decrease test coverage
5. Include documentation updates if applicable

---

## Scoring System
- **Milestones**: 40 points × team size (e.g., 160 points for 4-person team)
- **Defense**: 30 points × team size (e.g., 120 points for 4-person team)
- **Total**: 70 points × team size

Evaluation criteria:
- **Functionality** (40%): All requirements met, features work correctly
- **Code Quality** (40%): Clean code, good patterns, proper testing, documentation
- **Team Collaboration** (20%): Evidence of teamwork, code reviews, task management

---

## Key Do's and Don'ts

### Do:
✓ Start implementation early - don't wait until milestones
✓ Use merge requests for all code changes
✓ Write tests as you code, not at the end
✓ Document architecture decisions
✓ Review each other's code thoughtfully
✓ Communicate blockers to the team immediately
✓ Commit regularly with clear messages

### Don't:
✗ Direct commits to main branch
✗ Skip testing for "quick fixes"
✗ Leave TODO comments without issues tracking them
✗ Add features beyond scope without team discussion
✗ Ignore failing CI/CD pipelines
✗ Wait until week 13 to start implementing
✗ Accept code without understanding it during reviews

---

## When I Assist You

I can help with:
- Feature implementation and debugging
- Test writing (unit and E2E)
- Code refactoring and optimization
- Documentation generation
- Architecture questions and design decisions
- Bug investigation and fixes
- Performance improvements

I will ask for:
- Clarification if requirements are ambiguous
- Confirmation before major refactors or breaking changes
- Authorization before force-pushing or other risky Git operations
- Team consensus on architectural decisions

---

## Project-Specific Notes

### Current Project: WineMarket Platform

**What it is:**
Multi-actor marketplace connecting winemakers, shop owners, and customers. Think "Airbnb for wine" with:
- Winemakers managing wines & events
- Shop owners managing inventory & orders
- Customers browsing, ordering, reviewing
- Cross-winemaker event invitations
- Premium admin moderation

**Entities**: 21+ tables (excellent scope)

**Key Actors**:
1. **Guest** → Browse only
2. **Customer** → Buy, review, attend events
3. **Winemaker** → Manage wines, host events, invite collaborators
4. **Shop Owner** → Manage inventory, process orders
5. **Admin** → Moderate, approve accounts, manage platform

**Current Progress**:
- ✅ Team assigned
- ✅ Tech stack locked
- ✅ GitLab repo with CI
- ✅ Jira setup with epics
- ✅ ERD complete (21 entities)
- ✅ Requirements doc complete
- ⏳ Use case diagram (in progress)
- ⏳ Role-permission matrix (CRITICAL NEXT STEP)
- ⏳ API endpoint design (CRITICAL NEXT STEP)
- ⏳ Figma completion (Adam)

### Critical Path to Milestone 1 Success

In this exact order:
1. **Role-Permission Matrix** (defines auth logic)
2. **API Endpoint List** (backend team starts from this)
3. **Backend Module Breakdown** (who owns what?)
4. **Use Case Diagram** (visual proof you understand system)
5. **Architecture.md** (document all decisions)
6. **Figma completion** (Adam)

If you get these 6 things RIGHT, Milestone 2 implementation is smooth.
If you get them WRONG, weeks 8-9 will be painful.

### Milestones Timeline (Actual)

**Week 6** (Now):
- Finalize design docs
- Role-permission matrix
- API design
- Figma complete

**Week 7**: Milestone 1 evaluation

**Weeks 8-9**: Backend implementation sprint
- Drizzle migrations
- Elysia routes + services
- OpenAPI generation
- Kubb setup

**Week 10**: Milestone 2 evaluation

**Weeks 11-12**: Frontend + Testing sprint

**Week 13**: Milestone 3 evaluation + Polish

**Exam week**: Defense

### Success Factors (From Real Projects)

What makes student teams succeed:
- ✅ Strong architecture = smooth implementation
- ✅ Clear role-permission matrix = auth works everywhere
- ✅ API-first approach = FE and BE never block each other
- ✅ Regular code review = catches issues early
- ✅ Jira discipline = nobody gets blocked
- ✅ Responsive communication = problems solved fast

What makes teams fail:
- ❌ Vague architecture → chaos in week 10
- ❌ Unclear roles → duplication and gaps
- ❌ No code review → bad patterns spread
- ❌ API designed later → FE guesses endpoints
- ❌ Skipped testing → surprises at defense

You're currently positioned for success. Keep the discipline.

---

## Backend Module Structure (For Ondra & Johnny)

Plan this in `/docs/api.md` before coding:

### Module Breakdown (Suggested for WineMarket)

```
auth              → login, register, refresh token, logout
users             → user profiles, address management
winemakers        → winemaker profiles
wines             → wine CRUD
events            → event CRUD
event_invites     → cross-winemaker invitations
orders            → create order, manage order items
shops             → shop management, inventory
products          → product CRUD
availability      → schedule management (regular + exceptions)
reviews           → product & winemaker reviews
comments          → event comments
admin             → user/content moderation
email             → notification sending
```

### Per-Module API Endpoints (Example: Auth)

Every module should list its routes:

```
POST   /auth/register      → Create account
POST   /auth/login        → Get JWT
POST   /auth/refresh      → Refresh token
POST   /auth/logout       → Invalidate session
GET    /auth/me           → Current user info
```

Create similar lists for all modules in `/docs/api.md`

### Why Matej Creates This List First

- ✅ Ondra & Johnny know what to build
- ✅ Adam (FE) knows what endpoints to call
- ✅ Clear ownership (who implements which module?)
- ✅ Prevents duplicate endpoints
- ✅ Defines success criteria

---

This single document defines your entire authorization system. Create it now in `/docs/roles.md`

### What It Is

A table where:
- **Rows** = User roles (Guest, Customer, Winemaker, Shop Owner, Admin)
- **Columns** = Features/actions
- **Cell** = Can this role do this action? (Yes/No/Conditional)

### Example Format

| Feature | Guest | Customer | Winemaker | Shop Owner | Admin |
|---------|-------|----------|-----------|------------|-------|
| Browse wines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create wine | ❌ | ❌ | ✅ (own) | ❌ | ✅ |
| Manage shop | ❌ | ❌ | ❌ | ✅ (own) | ✅ |
| Approve events | ❌ | ❌ | ❌ | ❌ | ✅ |
| View all orders | ❌ | ✅ (own) | ❌ | ✅ (own) | ✅ |
| Moderate reviews | ❌ | ❌ | ❌ | ❌ | ✅ |

Legend:
- ✅ = Full access
- ❌ = No access
- (own) = Only their own resources
- Conditional = Depends on status/approval

### Why This Matters

This matrix becomes:
1. **Backend**: Role checks in every service method
2. **Frontend**: Show/hide UI based on roles
3. **Database**: Store role on User entity
4. **API**: Include role in JWT token
5. **Testing**: Test matrix exhaustively

### How Matej Creates This

Your job as team lead:
1. List all user roles from PRD
2. List all major features from PRD
3. Fill in the matrix with PRD logic
4. Review with entire team (must be unanimous)
5. Commit to `/docs/roles.md`
6. Backend team implements from this

---

### Epics (Should Match Backend Modules)

Create these epics — one per module:
- Auth (login, register, roles)
- Users (profiles, management)
- Winemakers (profiles, management)
- Wines (CRUD, inventory)
- Events (CRUD, invitations)
- Orders (checkout, payment, fulfillment)
- Shops (management, inventory)
- Reviews & Comments (moderation)
- Admin (platform management)
- Email (notifications)
- UI/Components (design system)
- DevOps (deployment, monitoring)

### Sprint 1 (Week 6-7) — Design Sprint

**Goal**: All design docs complete before Milestone 1 evaluation

**Tasks**:
- Create Role-Permission Matrix
- Design API endpoints (list main ones)
- Design backend module structure
- Generate Use Case diagram
- Write architecture.md
- Finalize Figma wireframes
- Setup GitLab CI
- Setup Turborepo monorepo

**Definition of Done**:
- Task has code/doc on feature branch
- Peer review completed
- Merged to dev
- Appears in documentation

### Sprint 2-4 Planning

Will be driven by API implementation order:
- Highest priority: Auth module
- Then: Core entity CRUDs
- Then: Complex features (events, orders)
- Finally: Admin & polish

### Weekly Standup (Mandatory)

Every team meeting:
1. **What did I do?** (5 min each)
2. **What will I do?** (5 min each)
3. **What's blocking me?** (5 min each)

**Write it down** → Put into retrospective docs → Shows collaboration at defense

### Definition of Done (Team Agreement)

A task is DONE when:
- ✅ Code written
- ✅ Lint passes
- ✅ Tests written
- ✅ Code reviewed & approved
- ✅ Merged to dev
- ✅ Documentation updated (if needed)

Never merge incomplete work.

---
