# Design: Delete Event Comment Endpoint

**Date:** 2026-06-15
**Branch:** WINE-306-guest-order-flow (to be implemented on its own ticket branch)

## Summary

Add `DELETE /events/:id/comments/:commentId` so that a comment author can delete their own comment, and an admin can delete any comment. Uses soft delete (`deletedAt`) consistent with all other deletion patterns in the codebase.

## Route

**`DELETE /events/:id/comments/:commentId`** in `apps/server/src/modules/events/events.routes.ts`

- Auth: `requireAuth: true`
- Handler extracts `dbUser.id` and `clerkPayload.roles?.includes("admin")` and passes both to the service
- Returns **204 No Content** on success
- New `commentParams` schema added to `events.schema.ts`:

```ts
export const commentParams = z.object({ id: z.string(), commentId: z.string() });
```

## Service

New method `deleteComment(eventId, commentId, userId, isAdmin)` on `EventsService`:

1. `findCommentById(db, commentId)` — fetch comment
2. If not found or already soft-deleted → throw `CommentNotFoundError`
3. If `comment.eventId !== eventId` → throw `CommentNotFoundError` (avoids leaking existence)
4. If `comment.userId !== userId` AND `!isAdmin` → throw `ForbiddenCommentActionError`
5. `softDeleteComment(db, commentId)`

## Repository

Two new functions added to `events.repository.ts`:

```ts
export async function findCommentById(db: Database, id: string): Promise<EventComment | undefined> {
  return db.query.eventComments.findFirst({
    where: and(eq(eventComments.id, id), isNull(eventComments.deletedAt)),
  });
}

export async function softDeleteComment(db: Database, commentId: string): Promise<void> {
  await db.update(eventComments).set({ deletedAt: new Date() }).where(eq(eventComments.id, commentId));
}
```

## Errors

Two new error classes added to `events.errors.ts` (both from `@repo/shared` base classes, which already exports `ForbiddenError`):

```ts
export class CommentNotFoundError extends NotFoundError {
  constructor() { super("Comment not found", "COMMENT_NOT_FOUND"); }
}

export class ForbiddenCommentActionError extends ForbiddenError {
  constructor() { super("You are not allowed to delete this comment", "FORBIDDEN_COMMENT_ACTION"); }
}
```

## Files Changed

| File | Change |
|------|--------|
| `apps/server/src/modules/events/events.schema.ts` | Add `commentParams` |
| `apps/server/src/modules/events/events.errors.ts` | Add `CommentNotFoundError`, `ForbiddenCommentActionError` |
| `apps/server/src/modules/events/events.repository.ts` | Add `findCommentById`, `softDeleteComment` |
| `apps/server/src/modules/events/events.service.ts` | Add `deleteComment` method |
| `apps/server/src/modules/events/events.routes.ts` | Add `DELETE /events/:id/comments/:commentId` |

## Out of Scope

- Admin moderation route under `/admin/comments/:id` — not needed; the single endpoint handles both roles
- Hard delete — all deletions in this codebase are soft
- Event winemaker moderation — decided against; only author + admin
