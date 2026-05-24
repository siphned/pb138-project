import { ConflictError, NotFoundError } from "@repo/shared";

export class RoleRequestNotFoundError extends NotFoundError {
  constructor() {
    super("Role request not found", "ROLE_REQUEST_NOT_FOUND");
  }
}

export class AlreadyRespondedError extends ConflictError {
  constructor() {
    super("This request has already been processed", "ALREADY_RESPONDED");
  }
}

export class AlreadyHasPendingRequestError extends ConflictError {
  constructor() {
    super("You already have a pending request for this role", "ALREADY_HAS_PENDING_REQUEST");
  }
}
