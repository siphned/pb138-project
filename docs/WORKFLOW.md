# Git Workflow — Jira Integration Guide

## Overview

Every code change is tied to a **Jira ticket**. The Jira issue key (`WINE-XX`) must appear in the branch name, commit message, and MR title. This connects GitLab activity (branches, commits, MRs) back to Jira automatically via the GitLab for Jira app.

---

## Jira Project

- **Project key**: `WINE`
- **Board**: Scrum board with sprints
- **Issue URL pattern**: `https://<your-jira>.atlassian.net/browse/WINE-XX`

---

## Branch Naming

```
<type>/WINE-<id>-<short-description>
```

| Type | When |
|------|------|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `chore/` | Config, tooling, CI |
| `refactor/` | Code restructure, no behavior change |
| `test/` | Adding or fixing tests |

**Examples:**
```
feature/WINE-42-auth-login-endpoint
feature/WINE-15-wine-crud-backend
fix/WINE-88-cart-merge-on-login
docs/WINE-5-api-endpoint-spec
chore/WINE-3-setup-ci-pipeline
```

**Rules:**
- Always include `WINE-XX` — Jira reads this to link the branch
- Use lowercase kebab-case after the ticket key
- Keep descriptions short (3–5 words)

---

## Commit Messages

Follow **Conventional Commits** with the Jira key in the scope:

```
<type>(WINE-<id>): <short description>
```

**Examples:**
```
feat(WINE-42): add POST /auth/login endpoint
fix(WINE-88): merge guest cart on login
docs(WINE-5): add auth module API spec
chore(WINE-3): add .gitlab-ci.yml pipeline
test(WINE-55): add unit tests for order service
refactor(WINE-61): extract address validation to utility
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation
- `chore` — maintenance / tooling
- `test` — tests only
- `refactor` — no behavior change
- `style` — formatting only

**Rules:**
- Lowercase, no period at end
- Max 72 characters on first line
- Body optional, separated by blank line

### Smart Commits (Jira Transitions)

To transition a Jira issue directly from a commit message, append:

```
feat(WINE-42): add login endpoint

WINE-42 #in-progress
```

```
feat(WINE-42): add login endpoint — complete

WINE-42 #done
```

Supported transitions (must match your Jira workflow statuses):
- `#to-do` → To Do
- `#in-progress` → In Progress  
- `#in-review` → In Review
- `#done` → Done

> Smart commits require the GitLab for Jira app to be authorized. See setup section below.

---

## Merge Request Titles & Description

**Title format:**
```
[WINE-XX] Short description of what this MR does
```

**Examples:**
```
[WINE-42] Add POST /auth/login endpoint
[WINE-15] Wine CRUD — backend routes, service, repository
[WINE-88] Fix cart merge on login
```

**MR Description template** (use when creating MRs):
```markdown
## What
Brief description of the change.

## Jira
[WINE-XX](https://<your-jira>.atlassian.net/browse/WINE-XX)

## Changes
- List key changes

## Testing
- How was this tested?

## Notes
Any relevant context for the reviewer.
```

---

## Full Workflow (Every Task)

```bash
# 1. Pick a Jira ticket → move it to "In Progress"
#    Note the ticket key, e.g. WINE-42

# 2. Start from dev
git checkout dev
git pull origin dev

# 3. Create branch with Jira key
git checkout -b feature/WINE-42-auth-login-endpoint

# 4. Work and commit (Jira key in every commit scope)
git add .
git commit -m "feat(WINE-42): add POST /auth/login endpoint"
git commit -m "feat(WINE-42): add JWT token generation"

# 5. Push branch
git push -u origin feature/WINE-42-auth-login-endpoint

# 6. Open MR on GitLab:
#    Title:  [WINE-42] Add POST /auth/login endpoint
#    Target: dev
#    Assign: yourself
#    Reviewer: Matej

# 7. Move Jira ticket to "In Review"

# 8. After approval + pipeline green → Squash & Merge → delete branch

# 9. Move Jira ticket to "Done"
```

---

## GitLab for Jira — Setup

> **Admin step (Matej):** This is a one-time setup in Jira.

1. Go to **Jira Settings → Apps → Find new apps**
2. Search for **GitLab for Jira Cloud**
3. Install and open the app
4. Click **Add namespace** → authenticate with GitLab
5. Select the `xsinogl/pb138-project` namespace
6. Once linked, Jira issues will show a **Development** panel with:
   - Branches referencing the issue key
   - Commits referencing the issue key
   - MRs referencing the issue key

> **Note:** The integration reads the issue key from branch names, commit messages, and MR titles automatically — no webhook setup needed.

---

## CI/CD Pipeline

Every MR and push to `dev`/`main` runs the pipeline:

| Stage | Jobs | What it checks |
|-------|------|----------------|
| `install` | `install` | `bun install --frozen-lockfile` |
| `lint` | `lint`, `format:check` | ESLint + Prettier |
| `typecheck` | `typecheck` | TypeScript `tsc --noEmit` |
| `build` | `build` | Full Turborepo build |
| `test` | `test:unit` | Vitest unit tests |

**Rules:**
- Feature branch pipelines run only on MR events (not direct pushes)
- `dev` and `main` always run full pipeline
- MR cannot be merged if pipeline is red

---

## Protected Branches

| Branch | Who can push | Who can merge |
|--------|-------------|---------------|
| `main` | Nobody directly | Maintainers via MR from `dev` (milestones only) |
| `dev` | Nobody directly | Developers via MR from feature branches |
| `feature/*` | Author | — |

---

## Quick Reference

```
Branch:  feature/WINE-42-short-name
Commit:  feat(WINE-42): description
MR:      [WINE-42] Description
```
