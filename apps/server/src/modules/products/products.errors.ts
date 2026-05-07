import { BadRequestError, NotFoundError } from "@repo/shared";

export class ProductNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Product with ID ${id} not found` : "Product not found", "PRODUCT_NOT_FOUND");
  }
}

export class InsufficientStockError extends BadRequestError {
  constructor(name?: string) {
    super(
      name ? `Insufficient stock for product: ${name}` : "Insufficient stock",
      "INSUFFICIENT_STOCK"
    );
  }
}

export class InvalidWineError extends BadRequestError {
  constructor() {
    super("One or more wines in the bundle are invalid or deleted", "INVALID_WINE");
  }
}
