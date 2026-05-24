import { ForbiddenError, NotFoundError } from "@repo/shared";

export class ShopNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Shop with ID ${id} not found` : "Shop not found", "SHOP_NOT_FOUND");
  }
}

export class ForbiddenShopActionError extends ForbiddenError {
  constructor() {
    super("You do not have permission to manage this shop", "FORBIDDEN_SHOP_ACTION");
  }
}
