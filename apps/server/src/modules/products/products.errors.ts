import { AppError, BadRequestError, NotFoundError } from "@repo/shared";

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

export class BundleMinWinesError extends BadRequestError {
  constructor() {
    super("A bundle requires at least 2 wines", "BUNDLE_MIN_WINES");
  }
}

export class DuplicateWineError extends BadRequestError {
  constructor() {
    super("Bundle cannot contain duplicate wines", "DUPLICATE_WINE");
  }
}

export class InconsistentDataError extends AppError {
  constructor() {
    super("Internal data inconsistency detected", 500, "INCONSISTENT_DATA");
  }
}

export class NoSupplyAgreementError extends BadRequestError {
  constructor() {
    super(
      "You need an approved supply agreement with this winemaker before stocking their wines",
      "NO_SUPPLY_AGREEMENT"
    );
  }
}
