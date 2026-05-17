import { NotFoundError } from "@repo/shared";

export class CartNotFoundError extends NotFoundError {
  constructor() {
    super("Cart not found", "CART_NOT_FOUND");
  }
}
