import { status } from "elysia";

export function handleError(e: unknown) {
  if (e instanceof Error) {
    switch (e.message) {
      case "NOT_FOUND":
        return status(404, "Not found");
      case "FORBIDDEN":
        return status(403, "Forbidden");
      case "CART_EMPTY":
        return status(400, "Cart is empty");
      case "MISSING_SHIPPING_ADDRESS":
        return status(400, "Shipping address is required");
      case "MISSING_BILLING_ADDRESS":
        return status(400, "Billing address is required");
      case "INSUFFICIENT_STOCK":
        return status(400, "Insufficient stock for one or more items");
      case "INVALID_TRANSITION":
        return status(409, "Order item status cannot be changed from its current state");
      case "ALREADY_HAS_PENDING_REQUEST":
        return status(409, "You already have a pending request for this role");
      case "ALREADY_RESPONDED":
        return status(400, "Request already processed");
    }
  }
  throw e;
}
