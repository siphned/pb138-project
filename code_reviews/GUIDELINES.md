# Code Review Guidelines

## Purpose

Code reviews in this project serve three purposes:
1. **Quality assurance**: Verify code meets CLAUDE.md standards and project patterns
2. **Progress tracking**: Document milestone completion and identify blockers
3. **Knowledge sharing**: Capture learnings and architectural decisions

---

## Review Schedule

| Review | Phase | Timing | Scope |
|--------|-------|--------|-------|
| **REVIEW_001** | Design (Week 6) | Milestone 1 complete | Spec docs, architecture, requirements |
| **REVIEW_002** | Infrastructure (Week 9) | Course end assessment | Implementation readiness, infrastructure |
| **REVIEW_003** | Milestone 2 (Week 10) | Implementation checkpoint | Backend modules, database, API |
| **REVIEW_004** | Milestone 3 (Week 13) | Final assessment | Complete feature set, testing, polish |

*Note: REVIEW_002 conducted at Week 9 (end of course) to assess infrastructure readiness for implementation phase to continue in future semesters.*

---

## Review Format

Each review document contains:
1. **Executive Summary** — High-level score and verdict
2. **Section-by-Section Analysis** — Detailed findings per category
3. **Scoreboard** — Quantified metrics for tracking
4. **Tracked Issues** — Actionable items linked to Jira

### File Naming

```
code_reviews/REVIEW_NNN_DESCRIPTION.md
├── REVIEW_001_WEEK6.md              (Milestone 1 — Design complete)
├── REVIEW_002_WEEK9.md              (Week 9 — Course assessment, infrastructure ready)
├── REVIEW_003_WEEK10.md             (Milestone 2 — Implementation checkpoint)
├── REVIEW_004_WEEK13.md             (Milestone 3 — Final assessment)
└── GUIDELINES.md                    (This file)
```

---

## Section Structure

Each review should follow this template:

```markdown
# CODE REVIEW #NNN — Winery Project

**Review Date:** 2026-04-XX (Week NN)  
**Reviewer:** Claude Code Review  
**Project Phase:** Week NN — [Phase name]  
**Scope:** [What's being reviewed]

---

## EXECUTIVE SUMMARY

| Metric | Score | Status |
|--------|-------|--------|
| **Category 1** | X% | ✅/⚠️/🔴 |
| **Category 2** | X% | ✅/⚠️/🔴 |

**Verdict:** [Overall assessment]

---

## 1. SECTION NAME

### 1.1 Subsection

**Status:** ✅ PASSED / ⚠️ WARNING / 🔴 FAILED

[Findings and details]

### 1.2 Tracked Issues

| Issue | Type | Status | Link |
|-------|------|--------|------|
| Missing docker-compose | 🔴 Blocker | Open | [WINE-109](#) |
| Needs refactor | ⚠️ Tech Debt | Backlog | [WINE-110](#) |

---

## SCORECARD

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Category 1 | X% | 0.XX | XX.X% |
| **TOTAL** | — | 1.00 | **XX.X%** |

---

## TRACKED ACTIONS

All issues below link to Jira for assignment and tracking:

### 🔴 Blockers (Must fix before next milestone)
- [ ] [WINE-109](link) — Code review process and guidelines

### ⚠️ Medium (Fix in current sprint)
- [ ] [WINE-110](link) — [Issue name]

### ℹ️ Nice-to-have (Backlog)
- [ ] [WINE-111](link) — [Issue name]

---

**End of Review #NNN**
```

---

## Actionable Issues

Reviews must contain a **Tracked Actions** section that links all findings to Jira issues. Format:

```markdown
## TRACKED ACTIONS

### 🔴 Blockers (Critical path)
- [ ] [WINE-NNN](https://pb138winery.atlassian.net/browse/WINE-NNN) — Issue title

### ⚠️ Medium Priority
- [ ] [WINE-NNN](https://pb138winery.atlassian.net/browse/WINE-NNN) — Issue title

### ℹ️ Nice-to-have / Backlog
- [ ] [WINE-NNN](https://pb138winery.atlassian.net/browse/WINE-NNN) — Issue title
```

---

## Creating Issues from Reviews

When a review identifies work:

1. **Blocker** (Status: 🔴) → Create Jira issue, assign, add to current sprint
2. **Medium** (Status: ⚠️) → Create Jira issue, backlog, target next sprint
3. **Nice-to-have** (Status: ℹ️) → Create Jira issue, low priority, future reference

**Naming convention:**
```
[WINE-NNN] Code review finding: [detailed description]
```

Example:
```
[WINE-109] Establish code review process and tracking format
[WINE-110] Refactor packages/ui component patterns
```

---

## Review Metadata

Include these fields in every review header:

- **Review Date**: When review was conducted (format: YYYY-MM-DD)
- **Week**: Project week number
- **Reviewer**: Always "Claude Code Review" (for consistency)
- **Phase**: Current project phase (Design, Implementation, Testing, etc.)
- **Scope**: What's being evaluated

---

## Scoring Guidelines

### Overall Score Calculation

```
Total Score = Σ(Category Score × Weight)
```

**Typical weightings:**
- Infrastructure/DevOps: 20%
- Implementation: 40%
- Code Quality: 20%
- Documentation: 10%
- Testing: 10%

**Adjust weights per phase:**
- Week 6 (Design): Documentation 50%, Infrastructure 50%
- Week 10 (Implementation): Implementation 50%, Code Quality 30%, Testing 20%
- Week 13 (Final): Implementation 30%, Code Quality 30%, Testing 30%, Docs 10%

### Category Scoring

| Score | Meaning | Symbol |
|-------|---------|--------|
| 90-100% | Complete, production-ready | ✅ PASSED |
| 70-89% | Mostly complete, minor gaps | ⚠️ PARTIAL |
| 50-69% | Significant work needed | ⚠️ AT RISK |
| 0-49% | Critical gaps, not ready | 🔴 FAILED |

---

## Checklist for Reviewer

Before finalizing a review:

- [ ] All metrics have scores
- [ ] Verdict matches overall score
- [ ] All findings have Jira links
- [ ] Actionable issues are specific (not vague)
- [ ] Scorecard math checks out
- [ ] File follows template format
- [ ] Review date and week are accurate
- [ ] Scope is clearly defined

---

## Examples

### Good Section (Trackable)

```markdown
### 2.1 Backend Modules

**Status:** 🔴 FAILED

| Module | Expected | Status |
|--------|----------|--------|
| auth.ts | Routes implemented | ❌ Missing |
| users.ts | User CRUD | ❌ Missing |

**Tracked Issues:**
- [WINE-55](https://pb138winery.atlassian.net/browse/WINE-55) — Implement Auth module (In Progress)
- [WINE-56](https://pb138winery.atlassian.net/browse/WINE-56) — Implement Users module (To Do)
```

### Bad Section (Not Trackable)

```markdown
### 2.1 Backend Modules

**Status:** Not good

The backend modules aren't done. We need auth and users implemented soon.
```

---

## Questions?

If a review finding doesn't map to an existing Jira issue, create one immediately using this template:

```
Title: [Code Review WINE-NNN] [Finding]
Type: Story / Task / Bug (as appropriate)
Description: 
  [Finding from review]
  
  **Why this matters:**
  [Impact on project]
  
  **Related review:**
  [Link to code_reviews/REVIEW_NNN.md]
Assignee: [Team member]
Priority: [Blocker / High / Medium / Low]
```

---

Last updated: 2026-04-19  
Maintained by: Matej Šinogl
