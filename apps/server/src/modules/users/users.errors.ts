import { NotFoundError } from "@repo/shared";

export class UserNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `User with ID ${id} not found` : "User not found", "USER_NOT_FOUND");
  }
}

export class AddressNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Address with ID ${id} not found` : "Address not found", "ADDRESS_NOT_FOUND");
  }
}
