# WINE-72 — Events Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace page stubs on `/events` and `/events/$id` with real UI. `/events/$id` includes registration (`usePostEventsByIdRegister` / `useDeleteEventsByIdRegister`), comments (`useGetEventsByIdComments` + `usePostEventsByIdComments`), and an owner-conditional Edit menu for the winemaker who created the event.

**Architecture:** Same cascade pattern as WINE-189. Domain components in `apps/web/src/components/events/` (new folder). Existing `routes/-components/EventCard.tsx` is moved to `components/events/`.

**Tech Stack:** Same as WINE-189.

**Predecessor:** WINE-187 merged. Independent of WINE-189 and WINE-190.

---

## Hard rules

Identical to WINE-189 §"Hard rules". Conventional commit prefix here: `feat(WINE-72):` / `refactor(WINE-72):` / `chore(WINE-72):`.

---

## 1. Branch bootstrap

Branch `WINE-72-build-event-pages-browsing-detail-registration` exists locally clean. Check out, merge primitives.

Once WINE-187 lands in dev, the merge is unnecessary.

```powershell
git fetch origin
git checkout WINE-72-build-event-pages-browsing-detail-registration
git merge origin/WINE-187-Foundation-primitives --no-ff -m "merge(WINE-72): bring in WINE-187 foundation primitives"
bun run --filter web test --run
bun run --filter web check-types
git push -u origin WINE-72-build-event-pages-browsing-detail-registration
```

---

## 2. Scope

**In:** `/events`, `/events/$id` (with register / unregister / comments / owner Edit menu).

**Out:** `/events/new`, `/events/$id/edit`, `/events/$id/images`, `/events/$id/invitations` — those are owner-forms scope (WINE-180). Stay as stubs.

---

## 3. Architecture decisions

### 3.1 New folder `components/events/`

Files:
- `EventCard.tsx` (moved from `routes/-components/EventCard.tsx`)
- `EventHero.tsx`
- `EventDetailsCard.tsx`
- `EventRegistrationButton.tsx` (owns register/unregister mutation state)
- `EventCommentList.tsx` (list + post)
- `EventManageMenu.tsx` (owner-gated)

### 3.2 Registration button design

`<EventRegistrationButton eventId={id}>` reads `useGetEventsById(id)` (already cached by parent route) for the registration status of the current user. Calls `usePostEventsByIdRegister` (register) or `useDeleteEventsByIdRegister` (unregister) on click. Shows three states:

- Not signed in → button label "Sign in to register", click → redirect to Clerk's sign-in.
- Signed in + not registered → "Register" (primary)
- Signed in + already registered → "Cancel registration" (destructive variant)
- Mutation in-flight → button disabled, label includes "…"

Optimistic update via TanStack Query's `onMutate` is OPTIONAL — start without it; if Adam wants snappier UX, add later.

### 3.3 Comments thread

`<EventCommentList eventId>` fetches `useGetEventsByIdComments(eventId)`. Renders each as a `<Card variant="section">` with avatar + author + body + timestamp. Below the list: a `<Textarea>` + `<Button>Post comment</Button>` form. Submission calls `usePostEventsByIdComments(eventId)`. Empty list → `<EmptyState message="Be the first to comment.">`.

---

## 4. File structure

### 4.1 New files

| Path | Lines | Responsibility |
|---|---|---|
| `apps/web/src/components/events/EventCard.tsx` | ~55 | Single event card. Title, date, location, winemaker name, image fallback to `<CatalogPlaceholder>` with date emoji |
| `apps/web/src/components/events/EventHero.tsx` | ~40 | Title + date/location + image |
| `apps/web/src/components/events/EventDetailsCard.tsx` | ~60 | Description + winemaker block + `<EventRegistrationButton>` |
| `apps/web/src/components/events/EventRegistrationButton.tsx` | ~50 | Register / Cancel button with mutation state |
| `apps/web/src/components/events/EventCommentList.tsx` | ~70 | Threaded comments + post form |
| `apps/web/src/components/events/EventManageMenu.tsx` | ~40 | Owner-gated dropdown: Edit, Images, Invitations, Cancel event |
| `apps/web/src/components/events/<name>.test.tsx` (6 files) | ~25 each | Test files |

### 4.2 Modified files

| Path | Change |
|---|---|
| `apps/web/src/routes/events.index.tsx` | Replace stub with `/explore`-style orchestrator using `<CatalogFilters entity="events">` (new variant) + `<DataGrid>` of `<EventCard>` |
| `apps/web/src/routes/events.$id.tsx` | Replace stub with `<EventHero>` + `<EventDetailsCard>` + `<EventManageMenu>` (owner-gated) + `<EventCommentList>` |

### 4.3 Delete

| Path | Reason |
|---|---|
| `routes/-components/EventCard.tsx` | Moved to `components/events/` |

---

## 5. Tasks

### Task 1: Branch bootstrap (§1)

### Task 2: Move `<EventCard>` to `components/events/`

`git mv routes/-components/EventCard.tsx components/events/EventCard.tsx`. Update importers. Audit for violations (lucide, skeletons, tokens). Add `EventCard.test.tsx` (≥3 tests). Commit: `refactor(WINE-72): move EventCard to components/events/`.

### Task 3: Create `<EventHero>`

Props: `event`. Top of detail page: title + date + location + winemaker link + hero image (or `<CatalogPlaceholder text="EVENT">`). ≥3 tests. Commit: `feat(WINE-72): add EventHero component`.

### Task 4: Create `<EventRegistrationButton>`

Owns the register mutation state. Tests:
- Renders "Sign in to register" when `useUser()` returns null user
- Renders "Register" when signed in but not registered
- Renders "Cancel registration" when signed in and already registered
- Fires `usePostEventsByIdRegister` on Register click
- Fires `useDeleteEventsByIdRegister` on Cancel click
- Disables button while mutation pending

Mock pattern from WINE-187 Task 9 (`vi.mock("@/context/UserContext")`). Mock the Orval hooks similarly. ≥6 tests. Commit: `feat(WINE-72): add EventRegistrationButton`.

### Task 5: Create `<EventDetailsCard>`

Composes `<DescriptionList>` for date/location/capacity + `<p>` description + `<EventRegistrationButton>`. ≥4 tests. Commit: `feat(WINE-72): add EventDetailsCard component`.

### Task 6: Create `<EventCommentList>`

Two-part component: list (fetched via `useGetEventsByIdComments`) + post form (`usePostEventsByIdComments`). Loading / error / empty handled via primitives. Form uses `<Textarea>` + `<Button>`; submit clears the textarea on success. ≥5 tests. Commit: `feat(WINE-72): add EventCommentList`.

### Task 7: Create `<EventManageMenu>`

Owner-gated dropdown with: Edit event → `/events/$id/edit`; Manage images → `/events/$id/images`; Manage invitations → `/events/$id/invitations`; Cancel event (button, calls `useDeleteEventsById` — TBD wiring; for now disabled with title "wired in owner-forms ticket"). ≥3 tests. Commit: `feat(WINE-72): add EventManageMenu owner-gated dropdown`.

### Task 8: Extend `<CatalogFilters>` with `entity="events"`

Add filter variant to `apps/web/src/components/catalog/CatalogFilters.tsx` (created in WINE-189). New filter rows: q (text), winemaker (select), status (approved/pending/canceled — admin-only? skip for public route). If WINE-189 hasn't merged yet, replicate the component locally. Commit: `feat(WINE-72): extend CatalogFilters with events variant`.

### Task 9: Migrate `/events` route

Canonical orchestrator. Cards: `<EventCard>`. Filter: `entity="events"`. Empty-state CTA: `<ShowOwner>` doesn't apply here; we need a role-aware "Create event" button for winemakers. Use `useUser()` + check `activeRole === "winemaker"` to render the CTA. Commit: `feat(WINE-72): migrate /events route to cascade pattern`.

### Task 10: Migrate `/events/$id` route

Replace stub with `<EventHero>` + `<EventDetailsCard>` + `<EventManageMenu>` (gated) + `<EventCommentList>`. Commit: `feat(WINE-72): migrate /events/$id route to cascade pattern`.

### Task 11: Delete obsolete file

`git rm apps/web/src/routes/-components/EventCard.tsx` (already gone via Task 2 `git mv`, but verify no stragglers).

### Task 12: Final verification

Same as WINE-189 Task 20. Manual sweep:
- `/events`
- `/events/<id>` as guest (Register button shows "Sign in")
- `/events/<id>` as customer (Register works, comments work)
- `/events/<id>` as the event's winemaker (Manage menu visible)
- Dark mode on all.

---

## 6. Per-route layout descriptions

### 6.1 `/events`

- `<PageHeader title="Events" description="Tastings, festivals, and winemaker meetups." actions={<ShowRole role="winemaker"><Button to="/events/new">+ Create event</Button></ShowRole>} />`
  - Note: `<ShowRole>` does not exist yet. Use `useUser()` and inline conditional render in the route file. If a clean `<ShowRole>` pattern emerges from later cluster work, refactor.
- Two-column from `lg:`: filters + `<DataGrid>` of `<EventCard>`.

### 6.2 `/events/$id`

- Back link "← Events".
- `<EventHero>` full-width with image.
- Two-column from `lg:`: left = `<EventDetailsCard>` (description + register button), right rail = winemaker mini-card (existing `<ProductWinemakerCard>` can be reused if generic enough; otherwise inline a small card).
- `<Section heading="Comments">` containing `<EventCommentList eventId={id}>`.

---

## 7. Verification gates

Same as WINE-189 §7.

---

## 8. Risks and open decisions

- **Registration status detection.** If `useGetEventsById` response doesn't include "is the current user registered?", `<EventRegistrationButton>` can't decide which state to render. Spec assumes the BE returns `registeredUserIds` or `isRegisteredByMe`. If neither exists, flag under §10 BE backlog; meanwhile button always shows "Register" and the BE responds with 409 on duplicate.
- **Cancel event mutation.** Disabled in this ticket — wiring requires owner-forms ticket.
- **`<ShowRole>` not in primitive layer.** Reasoning: only events list page needs role-gated CTA so far. If this pattern recurs in WINE-191 (dashboard quick-actions), promote it. Until then, inline `useUser()` check is fine.

---

## 9. Success criteria

1. 6 new files in `components/events/` (+ 6 tests).
2. `/events` and `/events/$id` use canonical orchestrator.
3. `<CatalogFilters>` extended with events variant.
4. Tests + typecheck + biome all green.
5. Adam visually confirms both routes across all role states.
6. Branch has ≥12 commits prefixed `feat(WINE-72):` / `refactor(WINE-72):` / `chore(WINE-72):`.

---

## 10. BE backlog handed off

(Populated during execution.)

Likely items:
- `useGetEventsById` response shape: does it include `isRegisteredByMe`?
- `useGetEvents?winemakerId=`, `?status=` — verify filters
- Comment author display name shape

---

## 11. Cross-ticket coordination

`<CatalogFilters>` lives in `components/catalog/` from WINE-189. Extending it from WINE-72 touches a file owned by WINE-189's branch. Coordinate merge order: ideally WINE-189 lands first; otherwise the conflict resolution merges both variant additions.
