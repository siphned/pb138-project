import { ConflictError, NotFoundError } from "@repo/shared";

export class AdminEventNotFoundError extends NotFoundError {
  constructor() {
    super("Event not found", "EVENT_NOT_FOUND");
  }
}

export class AdminReviewNotFoundError extends NotFoundError {
  constructor() {
    super("Review not found", "REVIEW_NOT_FOUND");
  }
}

export class AdminUserNotFoundError extends NotFoundError {
  constructor() {
    super("User not found", "USER_NOT_FOUND");
  }
}

export class EventNotPendingError extends ConflictError {
  constructor() {
    super("Event is not in pending status", "NOT_PENDING");
  }
}
