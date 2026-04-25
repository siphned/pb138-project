# Architecture Audit Guidelines

## Purpose

An architecture audit is a structured review of the codebase against its design documents, agreed conventions, and course requirements. Audits produce a living document that tracks divergences, decisions, and outstanding work — not just a snapshot.

## When to Run an Audit

- At the start of a new sprint when the codebase has grown significantly
- Before a milestone evaluation
- When adding a major new subsystem (auth, payments, notifications)
- When onboarding a new team member who needs a fast mental model

---

## Audit Document Format

Each audit lives in its own folder in `docs/audit/` named `YYYY-MM-DD-<topic>/` (e.g. `docs/audit/2026-04-24-architecture-audit/`).

### Folder Contents

- `audit.md`: The primary audit document (follows the format below).
- `replies.md` (optional): Threaded responses from other team members.
- `extensions.md` (optional): Supplemental findings or deeper dives added after the initial audit.
- Any relevant artifacts (diagrams, small logs, etc.).

### `audit.md` Format

```
# Audit — <Topic> (<Date>)

## Meta
- Date: YYYY-MM-DD
- Auditor: <name>
- Scope: what was reviewed
- Status: OPEN | CLOSED

## Summary
One-paragraph executive summary of the overall health of the audited area.

## Findings

### <Finding Title>
- **Area:** backend | frontend | database | toolchain | docs
- **Severity:** critical | major | minor | info
- **Status:** ✅ resolved | 🔄 in progress | ❌ open
- **Current state:** What the code actually does right now.
- **Expected state:** What the docs / decisions say it should do.
- **Divergence:** Why they differ, if known.
- **Decision:** The agreed resolution (if any).
- **Action items:** Specific tasks to close the finding.

## Decisions Log
Table of architecture decisions made during this audit, cross-referenced to findings.

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | ... | ... | ✅ done / 🔄 pending |

## Outstanding Work
Ordered list of everything that still needs to happen to fully close this audit.
```

---

## Severity Definitions

| Level | Meaning |
|-------|---------|
| **critical** | Blocks correct operation or security. Must fix before next merge to `dev`. |
| **major** | Contradicts agreed architecture. Should fix within current sprint. |
| **minor** | Code smell, missing convention, non-blocking. Fix when touching that area. |
| **info** | Observation or future consideration. No immediate action required. |

---

## Conducting the Audit

1. **Read the reference docs first** — `docs/ARCHITECTURE/`, `docs/ROLES/`, `docs/ROUTES/`, `CLAUDE.md`, course materials.
2. **Walk the code layer by layer** — DB schema → repositories → services → routes → frontend routes → components.
3. **For each layer, ask:**
   - Does the code match what the docs describe?
   - Are all invariants enforced (soft delete, FK constraints, auth guards)?
   - Does the data flow make sense end-to-end?
4. **Record every divergence** as a Finding. Do not fix during the audit — record first, decide later.
5. **Discuss decisions** with the team before marking anything resolved.
6. **Update the audit document** as items are resolved. Do not delete closed findings — they are part of the decision record.

---

## Working from an Audit Document

- **Outstanding Work** is the canonical backlog for fixing findings.
- When you create a Jira ticket from a finding, note the ticket key next to the action item.
- When a finding is fully resolved, update its **Status** to ✅ resolved and add a brief note of what changed.
- **Never close an audit** (set `Status: CLOSED`) until all critical and major findings are ✅ resolved.
