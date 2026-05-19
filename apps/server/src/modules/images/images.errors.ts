import { AppError, BadRequestError, NotFoundError } from "@repo/shared";

export class ImageNotFoundError extends NotFoundError {
  constructor() {
    super("Image not found", "IMAGE_NOT_FOUND");
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor() {
    super("Unsupported media type", 415, "UNSUPPORTED_MEDIA_TYPE");
  }
}

export class PayloadTooLargeError extends AppError {
  constructor() {
    super("File exceeds maximum allowed size", 413, "PAYLOAD_TOO_LARGE");
  }
}

export class ImageLimitExceededError extends BadRequestError {
  constructor() {
    super("Image limit for this entity has been reached", "IMAGE_LIMIT_EXCEEDED");
  }
}
