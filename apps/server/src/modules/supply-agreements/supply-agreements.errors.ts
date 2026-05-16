import { ConflictError, ForbiddenError, NotFoundError } from "@repo/shared";

export class SupplyAgreementNotFoundError extends NotFoundError {
  constructor() {
    super("Supply agreement not found", "SUPPLY_AGREEMENT_NOT_FOUND");
  }
}

export class NotAWinemakerError extends ForbiddenError {
  constructor() {
    super("User is not a winemaker", "NOT_A_WINEMAKER");
  }
}

export class AlreadyRespondedError extends ConflictError {
  constructor() {
    super("This request has already been responded to", "ALREADY_RESPONDED");
  }
}
