import { BadRequestError, ConflictError, NotFoundError } from "@repo/shared";

export class ReviewNotFoundError extends NotFoundError {
  constructor() {
    super("Review not found", "REVIEW_NOT_FOUND");
  }
}

export class AlreadyReviewedError extends ConflictError {
  constructor() {
    super("You have already reviewed this item", "ALREADY_REVIEWED");
  }
}

export class NotPurchasedError extends BadRequestError {
  constructor() {
    super("You must purchase this item before reviewing it", "NOT_PURCHASED");
  }
}
