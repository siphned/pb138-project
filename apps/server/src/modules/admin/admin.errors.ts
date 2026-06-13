import { NotFoundError } from "@repo/shared";

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
