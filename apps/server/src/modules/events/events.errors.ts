import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@repo/shared";

export class EventNotFoundError extends NotFoundError {
  constructor() {
    super("Event not found", "EVENT_NOT_FOUND");
  }
}

export class InvalidDatesError extends BadRequestError {
  constructor() {
    super("Invalid dates: start must be in the future, end must be after start", "INVALID_DATES");
  }
}

export class EventNotAvailableError extends BadRequestError {
  constructor() {
    super("Event is not available for this action", "EVENT_NOT_AVAILABLE");
  }
}

export class AlreadyRegisteredError extends ConflictError {
  constructor() {
    super("You are already registered for this event", "ALREADY_REGISTERED");
  }
}

export class CapacityFullError extends ConflictError {
  constructor() {
    super("Event is at full capacity", "CAPACITY_FULL");
  }
}

export class CapacityTooLowError extends BadRequestError {
  constructor() {
    super("Capacity cannot be lower than current registration count", "CAPACITY_TOO_LOW");
  }
}

export class EventStatusConflictError extends ConflictError {
  constructor() {
    super("Event cannot be edited in its current status", "EVENT_STATUS_CONFLICT");
  }
}

export class CommentNotFoundError extends NotFoundError {
  constructor() {
    super("Comment not found", "COMMENT_NOT_FOUND");
  }
}

export class ForbiddenCommentActionError extends ForbiddenError {
  constructor() {
    super("You are not allowed to delete this comment", "FORBIDDEN_COMMENT_ACTION");
  }
}
