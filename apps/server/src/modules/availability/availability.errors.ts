import { BadRequestError, NotFoundError } from "@repo/shared";

export class InvalidTimeRangeError extends BadRequestError {
  constructor() {
    super("Invalid time range: end must be after start", "INVALID_TIME_RANGE");
  }
}

export class AvailabilityEntryNotFoundError extends NotFoundError {
  constructor() {
    super("Availability entry not found", "AVAILABILITY_ENTRY_NOT_FOUND");
  }
}
