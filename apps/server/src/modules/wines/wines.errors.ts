import { ForbiddenError, NotFoundError } from "@repo/shared";

export class WineNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Wine with ID ${id} not found` : "Wine not found", "WINE_NOT_FOUND");
  }
}

export class WinemakerNotFoundError extends NotFoundError {
  constructor() {
    super("Winemaker profile not found for this user", "WINEMAKER_NOT_FOUND");
  }
}

export class ForbiddenWineActionError extends ForbiddenError {
  constructor() {
    super("You do not have permission to manage this wine", "FORBIDDEN_WINE_ACTION");
  }
}
