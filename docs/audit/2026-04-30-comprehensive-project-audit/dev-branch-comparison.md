# Dev Branch Comparison (2026-04-30)

## Current Branch vs Dev

**Audit Branch:** `WINE-157-resolve-audit-findings` (5361e76)  
**Dev Branch:** `dev` (1437e80 — Repository pattern refactor merge)  
**Commits ahead on audit:** 3 additional commits

---

## Dev Branch Status

| Metric | Dev | Audit Branch | Delta |
|--------|-----|--------------|-------|
| Build | ✅ PASS | ✅ PASS | — |
| TypeScript | ✅ 0 errors | ✅ 0 errors | — |
| Unit Tests | ✅ 270 pass | ✅ 270 pass | — |
| Branch age | 2026-04-23 | 2026-04-30 | 7 days |
| Commits ahead of main | 16 | 19 | +3 |

---

## Commits Ahead on Audit Branch

```
5361e76 docs(WINE-157): remove type prefix from branch naming convention
3ffb4ab fix(server): resolve April 29-30 audit findings
1437e80 [WINE-147] refactor(server): decouple service layer with repository pattern (#74)
```

**Branch point:** 1437e80 (latest on dev) = base of audit branch

**Additional fixes on audit branch:**
1. **3ffb4ab** — `fix(server): resolve April 29-30 audit findings`
   - Removed `export * from "./schemas"` from `@repo/shared` (decouples Drizzle from main barrel)
   - Added error logging to `export-spec.ts`
   - Suppressed `DATABASE_URL not set` warning in test mode
   - **Impact:** Minor architectural cleanup, no functionality change

2. **5361e76** — `docs(WINE-157): remove type prefix from branch naming convention`
   - Documentation-only commit
   - **Impact:** None on code

---

## What Dev Is Missing (vs Audit Branch)

Since dev is 2 commits behind the audit branch, it's missing:
1. Shared schema export cleanup (minor architectural improvement)
2. Error logging in export-spec.ts (better debugging)
3. Test DATABASE_URL warning suppression (quieter test output)

**Functional impact:** None. These are cleanup/polish changes.

---

## Audit Findings Apply to Both Branches

All 18 findings in `audit.md` apply equally to dev branch:

### Critical for Dev:
- F-01: Email not wired
- F-02: Admin pages are stubs
- F-05: No staging deployment
- F-06: E2E tests minimal
- F-08: Order listing endpoint missing
- F-13: Winemaker/Shop onboarding missing

### Dev-Specific Notes

**Recommendation:** Merge audit branch fixes to dev before starting Phase 1 implementation.

```bash
git checkout dev
git pull origin WINE-157-resolve-audit-findings
# or cherry-pick the 2 commits (3ffb4ab, 5361e76)
```

---

## Summary

**Dev is at a solid checkpoint** — after repository pattern refactor, before audit findings fixes. Both branches:
- ✅ Build successfully
- ✅ Pass all 270 tests
- ✅ Have solid architecture

**Next step:** Merge audit branch into dev to capture cleanup fixes, then proceed with Phase 1 (backend gaps).

Implementation plan in `implementation-plan.md` applies to both branches equally.
